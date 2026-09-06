import React,{useState} from 'react';
import {Check,LoaderCircle,Pencil,Sparkles,X} from 'lucide-react';
import {base44} from '@/api/base44Client';
import '@/note-assistant.css';

const sourceLabel={client_reported:'Client reported',specialist_observed:'Specialist observed',specialist_note:'Specialist note',unknown:'Source not specified'};

export default function EmployeeNoteTaker({caseData,onReview}){
  const[input,setInput]=useState('');
  const[items,setItems]=useState([]);
  const[unmapped,setUnmapped]=useState([]);
  const[analysisComplete,setAnalysisComplete]=useState(false);
  const[busy,setBusy]=useState(false);
  const[reviewingId,setReviewingId]=useState('');
  const[error,setError]=useState('');

  const analyse=async()=>{
    if(!input.trim()||busy||items.length)return;
    setBusy(true);setError('');
    try{
      const response=await base44.functions.invoke('analyseCaseNote',{caseId:caseData.id,note:input.trim(),currentReport:caseData.report});
      setItems((response.data.suggestedUpdates||[]).map(item=>({...item,editing:false,finalValue:item.value})));
      setUnmapped(response.data.unmappedInformation||[]);
      setAnalysisComplete(true);
    }catch(e){
      if(!e?.response)setError('Connection interrupted. No report changes were made. Your notes are still here.');
      else setError(e.response.data?.error||"We couldn't analyse these notes right now. Your notes have not been lost. Please try again.");
    }finally{setBusy(false)}
  };

  const update=(index,changes)=>setItems(current=>current.map((item,itemIndex)=>itemIndex===index?{...item,...changes}:item));
  const review=async(item,index,decision)=>{
    if(reviewingId)return;
    setReviewingId(item.id);setError('');
    try{
      await onReview({...item,originalValue:item.originalValue||item.value,finalValue:item.finalValue||item.value},decision);
      setItems(current=>current.filter((_,itemIndex)=>itemIndex!==index));
    }catch(e){setError(e?.response?.data?.error||e.message||'The review could not be saved. No report changes were made.');}
    finally{setReviewingId('')}
  };

  return <aside className="sr-assistant"><div className="sr-ai-title"><Sparkles/><div><h2>AI note assistant</h2><p>Add interview facts, then review suggestions.</p></div></div><label htmlFor="employee-consultation-notes">Notes</label><textarea id="employee-consultation-notes" value={input} onChange={event=>{setInput(event.target.value);setAnalysisComplete(false);}} placeholder="Add key information from the consultation..." maxLength={6000}/><button type="button" className="sr-primary" disabled={!input.trim()||busy||Boolean(reviewingId)||items.length>0} onClick={analyse}>{busy?<LoaderCircle className="sr-spin" size={16}/>:<Sparkles size={15}/>} {busy?'Analysing notes...':'Analyse Notes'}</button>{error&&<p className="paper-error" role="alert">{error}</p>}<div aria-live="polite">{items.length>0&&<p className="sr-suggestion-count">{items.length} suggested report {items.length===1?'update':'updates'}</p>}{analysisComplete&&items.length===0&&!error&&<p className="sr-muted">{unmapped.length?'Some note text could not be mapped safely. No report changes were proposed.':'No new report updates were identified.'} Your notes remain above.</p>}</div>{items.map((item,index)=><article className="sr-suggestion" key={item.id}><header><b>{item.operation.toUpperCase()}</b><span className="sr-badge">AI suggestion</span></header><h3>{item.label}</h3>{item.previousValue&&item.operation==='update'&&<p className="sr-previous-value"><span>Currently</span>{item.previousValue}</p>}{item.editing?<div className="sr-suggestion-edit"><Pencil size={13}/><textarea aria-label={`Edit ${item.label}`} value={item.finalValue} onChange={event=>update(index,{finalValue:event.target.value})}/></div>:<p>{item.finalValue}</p>}<small>Source: {sourceLabel[item.sourceType]||sourceLabel.unknown}</small><div className="sr-suggestion-actions">{item.editing?<><button type="button" disabled={!item.finalValue.trim()||Boolean(reviewingId)} onClick={()=>review(item,index,'approved')}><Check size={14}/>Approve edited update</button><button type="button" disabled={Boolean(reviewingId)} onClick={()=>update(index,{editing:false,finalValue:item.originalValue||item.value})}><X size={14}/>Cancel</button></>:<><button type="button" disabled={Boolean(reviewingId)} onClick={()=>review(item,index,'approved')}><Check size={14}/>{reviewingId===item.id?'Saving...':'Approve'}</button><button type="button" disabled={Boolean(reviewingId)} onClick={()=>update(index,{editing:true})}><Pencil size={14}/>Edit</button><button type="button" disabled={Boolean(reviewingId)} onClick={()=>review(item,index,'rejected')}><X size={14}/>Ignore</button></>}</div></article>)}</aside>;
}
