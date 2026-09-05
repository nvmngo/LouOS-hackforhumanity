import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {LoaderCircle,Send} from 'lucide-react';
import {base44} from '@/api/base44Client';
import OnlineReportSection from '@/components/mvp/online/OnlineReportSection';
import {onlineReportSections} from '@/components/mvp/online/onlineReportFields';
import '@/online-report.css';
export default function OnlineReportForm(){
  const navigate=useNavigate();
  const [values,setValues]=useState({date:new Date().toISOString().slice(0,10)});
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const update=(id,value)=>setValues(current=>({...current,[id]:value}));
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');
    try{
      const response=await base44.functions.invoke('chatCaseAssistant',{operation:'online_report',input:JSON.stringify(values)});
      const caseId=`LP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
      sessionStorage.setItem('louosOnlineReport',JSON.stringify({caseId,answers:values,draft:response.data.result.draft}));
      navigate('/summary');
    }catch(err){setError(err?.response?.data?.error||err.message||'The report could not be prepared. Please try again.');setBusy(false);}
  };
  return <form className="online-report" onSubmit={submit}>
    <header className="online-intro"><p className="mvp-kicker">Online report</p><h1>Client intake form</h1><p>Please answer clearly and leave blank anything you would rather not answer. Nothing entered here should be shared outside Lou’s Place.</p></header>
    {onlineReportSections.map(section=><OnlineReportSection key={section.title} section={section} values={values} onChange={update}/>)}
    {error&&<p className="online-error" role="alert">{error}</p>}
    <button className="mvp-btn online-submit" disabled={busy}>{busy?<><LoaderCircle className="online-spin"/>Preparing summary…</>:<>Submit online report <Send size={18}/></>}</button>
  </form>;
}