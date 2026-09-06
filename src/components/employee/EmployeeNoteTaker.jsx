import React,{useEffect,useRef,useState} from 'react';
import {Check,Clock,LoaderCircle,Pencil,RotateCcw,Sparkles,X} from 'lucide-react';
import {base44} from '@/api/base44Client';
import '@/note-assistant.css';
import {employeeToken} from '@/lib/employeeSession';

// Only the sources that tell the reader something they cannot already infer.
// Every suggestion here comes from the specialist's own note, so labelling one
// "Specialist note" adds nothing and reads as if it were a separate document.
const sourceLabel={client_reported:'Client reported',specialist_observed:'Specialist observed'};

const newNoteId=()=>`note-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

export default function EmployeeNoteTaker({caseData,onReview}){
  const[input,setInput]=useState('');
  const[items,setItems]=useState([]);
  const[queue,setQueue]=useState([]);
  const[unmapped,setUnmapped]=useState([]);
  const[analysedCount,setAnalysedCount]=useState(0);
  const[failed,setFailed]=useState([]);
  const[reviewingId,setReviewingId]=useState('');
  const[error,setError]=useState('');

  // The queue lives in a ref as well as in state: the drain loop reads and
  // shifts it between awaits, which a captured state snapshot cannot do.
  const queueRef=useRef([]);
  const drainingRef=useRef(false);
  const aliveRef=useRef(true);
  // A queued note is analysed against the report as it stands when its turn
  // comes, not as it stood when it was typed, so suggestions approved while it
  // waited are not proposed a second time.
  const caseRef=useRef(caseData);

  useEffect(()=>{caseRef.current=caseData;},[caseData]);
  useEffect(()=>()=>{aliveRef.current=false;},[]);

  const syncQueue=()=>{if(aliveRef.current)setQueue(queueRef.current.map(note=>({id:note.id,text:note.text,status:note.status})));};

  const drain=async()=>{
    if(drainingRef.current)return;
    drainingRef.current=true;
    try{
      while(queueRef.current.length){
        const note=queueRef.current[0];
        note.status='analysing';
        syncQueue();
        try{
          const response=await base44.functions.invoke('analyseCaseNote',{caseId:caseRef.current.id,note:note.text,currentReport:caseRef.current.report,employeeToken:employeeToken()});
          if(!aliveRef.current)return;
          // Suggestion ids are generated per request, so they are namespaced by
          // note before several batches share one list.
          setItems(current=>[...current,...(response.data.suggestedUpdates||[]).map((item,index)=>({...item,key:`${note.id}-${item.id||index}`,editing:false,finalValue:item.value}))]);
          setUnmapped(current=>[...current,...(response.data.unmappedInformation||[])]);
          setAnalysedCount(count=>count+1);
        }catch(analysisError){
          if(!aliveRef.current)return;
          // The note text is kept so a failed analysis never loses what was typed.
          setFailed(current=>[...current,{id:note.id,text:note.text,message:analysisError?.response?analysisError.response.data?.error||"We couldn't analyse this note right now. It has not been lost — restore it below and try again.":'Connection interrupted. No report changes were made. This note has not been lost — restore it below and try again.'}]);
        }finally{
          queueRef.current=queueRef.current.slice(1);
          syncQueue();
        }
      }
    }finally{drainingRef.current=false;}
  };

  const enqueue=()=>{
    const text=input.trim();
    if(!text)return;
    queueRef.current=[...queueRef.current,{id:newNoteId(),text,status:'queued'}];
    // Clearing the box straight away is the point of the queue: the next note
    // can be typed while this one is still with the model.
    setInput('');
    setError('');
    syncQueue();
    drain();
  };

  const handleKeyDown=event=>{
    // Enter sends, Shift+Enter starts a new line. isComposing guards IME input
    // so an Enter that only confirms a character does not send the note.
    if(event.key!=='Enter'||event.shiftKey||event.nativeEvent?.isComposing)return;
    event.preventDefault();
    enqueue();
  };

  const restore=note=>{
    setInput(current=>current.trim()?`${current.trim()}\n${note.text}`:note.text);
    setFailed(current=>current.filter(item=>item.id!==note.id));
  };

  const update=(key,changes)=>setItems(current=>current.map(item=>item.key===key?{...item,...changes}:item));
  const review=async(item,decision)=>{
    if(reviewingId)return;
    setReviewingId(item.id);setError('');
    try{
      await onReview({...item,originalValue:item.originalValue||item.value,finalValue:item.finalValue||item.value},decision);
      setItems(current=>current.filter(entry=>entry.key!==item.key));
    }catch(reviewError){setError(reviewError?.response?.data?.error||reviewError.message||'The review could not be saved. No report changes were made.');}
    finally{setReviewingId('')}
  };

  const analysing=queue.some(note=>note.status==='analysing');
  const waiting=queue.filter(note=>note.status!=='analysing').length;
  const nothingFound=analysedCount>0&&!queue.length&&!items.length&&!failed.length&&!error;

  return <aside className="sr-assistant">
    <div className="sr-ai-title"><Sparkles/><div><h2>AI note assistant</h2><p>Add interview facts, then review suggestions.</p></div></div>
    <label htmlFor="employee-consultation-notes">Notes</label>
    <textarea id="employee-consultation-notes" value={input} onChange={event=>setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Add key information from the consultation..." maxLength={6000}/>
    <p className="sr-note-hint">Enter sends the note · Shift + Enter for a new line</p>
    <button type="button" className="sr-primary" disabled={!input.trim()} onClick={enqueue}><Sparkles size={15}/> Analyse Notes</button>
    {error&&<p className="paper-error" role="alert">{error}</p>}
    <div aria-live="polite">
      {Boolean(queue.length)&&<div className="sr-queue">
        {analysing&&<p className="sr-queue-item analysing"><LoaderCircle className="sr-spin" size={13}/>Analysing note…</p>}
        {waiting>0&&<p className="sr-queue-item"><Clock size={13}/>{waiting} {waiting===1?'note':'notes'} queued</p>}
      </div>}
      {failed.map(note=><div className="sr-queue-failed" key={note.id}>
        <p className="paper-error" role="alert">{note.message}</p>
        <blockquote>{note.text}</blockquote>
        <button type="button" onClick={()=>restore(note)}><RotateCcw size={13}/>Restore note</button>
      </div>)}
      {items.length>0&&<p className="sr-suggestion-count">{items.length} suggested report {items.length===1?'update':'updates'}</p>}
      {nothingFound&&<p className="sr-muted">{unmapped.length?'Some note text could not be mapped safely. No report changes were proposed.':'No new report updates were identified.'} Your notes remain above.</p>}
    </div>
    {items.map(item=><article className="sr-suggestion" key={item.key}>
      <header><b>{item.operation.toUpperCase()}</b><span className="sr-badge">AI suggestion</span></header>
      <h3>{item.label}</h3>
      {item.previousValue&&item.operation==='update'&&<p className="sr-previous-value"><span>Currently</span>{item.previousValue}</p>}
      {item.editing
        ?<div className="sr-suggestion-edit"><Pencil size={13}/><textarea aria-label={`Edit ${item.label}`} value={item.finalValue} onChange={event=>update(item.key,{finalValue:event.target.value})}/></div>
        :<p>{item.finalValue}</p>}
      {sourceLabel[item.sourceType]&&<small>Source: {sourceLabel[item.sourceType]}</small>}
      <div className="sr-suggestion-actions">{item.editing
        ?<><button type="button" disabled={!item.finalValue.trim()||Boolean(reviewingId)} onClick={()=>review(item,'approved')}><Check size={14}/>Approve edited update</button><button type="button" disabled={Boolean(reviewingId)} onClick={()=>update(item.key,{editing:false,finalValue:item.originalValue||item.value})}><X size={14}/>Cancel</button></>
        :<><button type="button" disabled={Boolean(reviewingId)} onClick={()=>review(item,'approved')}><Check size={14}/>{reviewingId===item.id?'Saving...':'Approve'}</button><button type="button" disabled={Boolean(reviewingId)} onClick={()=>update(item.key,{editing:true})}><Pencil size={14}/>Edit</button><button type="button" disabled={Boolean(reviewingId)} onClick={()=>review(item,'rejected')}><X size={14}/>Ignore</button></>}</div>
    </article>)}
  </aside>;
}
