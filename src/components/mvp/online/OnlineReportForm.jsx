import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {LoaderCircle,Send} from 'lucide-react';
import {base44} from '@/api/base44Client';
import OnlineReportSection from '@/components/mvp/online/OnlineReportSection';
import {onlineReportSections} from '@/components/mvp/online/onlineReportFields';
import '@/online-report.css';

const localDate=()=>{const date=new Date();date.setMinutes(date.getMinutes()-date.getTimezoneOffset());return date.toISOString().slice(0,10);};

export default function OnlineReportForm({onSubmitted,cancelPath}){
  const navigate=useNavigate();
  const [values,setValues]=useState({date:localDate()});
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const update=(id,value)=>setValues(current=>({...current,[id]:value}));
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');
    try{
      const answers=Object.fromEntries(Object.entries(values).filter(([,value])=>Array.isArray(value)?value.length:typeof value==='string'?value.trim():value!=null).map(([key,value])=>[key,typeof value==='string'?value.trim():value]));
      if(onSubmitted){await onSubmitted(answers);return;}
      const response=await base44.functions.invoke('chatCaseAssistant',{operation:'online_report',input:JSON.stringify(answers)});
      const caseId=`LP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
      sessionStorage.setItem('louosOnlineReport',JSON.stringify({caseId,answers,draft:response.data.result.draft}));
      navigate('/summary');
    }catch(err){setError(err?.response?.data?.error||err.message||'The report could not be prepared. Please try again.');setBusy(false);}
  };
  const renderSection=section=><OnlineReportSection key={section.title} section={section} values={values} onChange={update}/>;
  return <form className="online-report" onSubmit={submit}>
    <header className="online-intro"><p className="online-form-title">WELCOME FORM</p><h1>Lou’s Place</h1><p><strong>Answer as much or as little as you feel comfortable sharing.</strong> You can leave any question blank. A Lou’s Place staff member can help you complete this form.</p><p>If you are unsure about a question, you can leave it blank and discuss it with a staff member.</p></header>
    <div className="online-form-vertical">{onlineReportSections.map(renderSection)}</div>
    {error&&<p className="online-error" role="alert">{error}</p>}
    <div className="online-actions">
      <button className="mvp-btn online-submit" disabled={busy}>{busy?<><LoaderCircle className="online-spin"/>Preparing summary…</>:<>Submit Form <Send size={22}/></>}</button>
      {cancelPath&&<button type="button" className="online-cancel" onClick={()=>navigate(cancelPath)} disabled={busy}>Cancel</button>}
    </div>
  </form>;
}
