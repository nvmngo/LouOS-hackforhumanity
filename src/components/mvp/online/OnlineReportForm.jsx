import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {LoaderCircle,Send} from 'lucide-react';
import {base44} from '@/api/base44Client';
import OnlineReportSection from '@/components/mvp/online/OnlineReportSection';
import {onlineReportSections} from '@/components/mvp/online/onlineReportFields';
import '@/online-report.css';
export default function OnlineReportForm({onSubmitted}){
  const navigate=useNavigate();
  const [values,setValues]=useState({date:new Date().toISOString().slice(0,10)});
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const update=(id,value)=>setValues(current=>({...current,[id]:value}));
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');
    try{
      if(onSubmitted){await onSubmitted(values);return;}
      const response=await base44.functions.invoke('chatCaseAssistant',{operation:'online_report',input:JSON.stringify(values)});
      const caseId=`LP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
      sessionStorage.setItem('louosOnlineReport',JSON.stringify({caseId,answers:values,draft:response.data.result.draft}));
      navigate('/summary');
    }catch(err){setError(err?.response?.data?.error||err.message||'The report could not be prepared. Please try again.');setBusy(false);}
  };
  const renderSection=section=><OnlineReportSection key={section.title} section={section} values={values} onChange={update}/>;
  return <form className="online-report" onSubmit={submit}>
    <header className="online-intro"><h1>Lou’s Place</h1><p className="online-form-title">WELCOME FORM</p><p><strong>Take your time, and leave blank anything you’d rather not answer.</strong> Someone on our team is happy to help you fill this in.</p></header>
    <div className="online-form-vertical">{onlineReportSections.map(renderSection)}</div>
    {error&&<p className="online-error" role="alert">{error}</p>}
    <button className="mvp-btn online-submit" disabled={busy}>{busy?<><LoaderCircle className="online-spin"/>Preparing summary…</>:<>Submit welcome form <Send size={18}/></>}</button>
  </form>;
}