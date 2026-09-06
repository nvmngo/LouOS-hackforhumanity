import React,{useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowUp,LoaderCircle,Languages,Send} from 'lucide-react';
import {base44} from '@/api/base44Client';
import OnlineReportSection from '@/components/mvp/online/OnlineReportSection';
import {buildSections,onlineLanguages,onlineText,validateAnswers} from '@/components/mvp/online/onlineReportContent';
import '@/online-report.css';

const localDate=()=>{const date=new Date();date.setMinutes(date.getMinutes()-date.getTimezoneOffset());return date.toISOString().slice(0,10);};

export default function OnlineReportForm({onSubmitted,cancelPath}){
  const navigate=useNavigate();
  const [values,setValues]=useState(/** @type {Record<string,any>} */({date:localDate()}));
  const [language,setLanguage]=useState('en');
  const [errors,setErrors]=useState(/** @type {Record<string,string>} */({}));
  const [showTop,setShowTop]=useState(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const text=onlineText(language);
  const direction=onlineLanguages.find(item=>item.code===language)?.dir||'ltr';
  useEffect(()=>{const onScroll=()=>setShowTop(window.scrollY>420);onScroll();window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll);},[]);
  const update=(id,value)=>{
    setValues(current=>({...current,[id]:value}));
    setErrors(current=>{if(!current[id])return current;const next={...current};delete next[id];return next;});
  };
  const changeLanguage=code=>{
    setLanguage(code);
    setErrors({});
    const englishName=onlineLanguages.find(item=>item.code===code)?.englishName;
    setValues(current=>{
      const stillAutofilled=onlineLanguages.some(item=>item.englishName===current.preferredLanguage);
      return current.preferredLanguage&&!stillAutofilled?current:{...current,preferredLanguage:englishName};
    });
  };
  const submit=async event=>{event.preventDefault();
    const missing=validateAnswers(language,values);
    setErrors(missing);
    if(Object.keys(missing).length){
      const first=document.querySelector('.online-field[data-error="true"]');
      first?.scrollIntoView({behavior:'smooth',block:'center'});
      first?.querySelector('input,textarea')?.focus({preventScroll:true});
      return;
    }
    setBusy(true);setError('');
    try{
      const answers=Object.fromEntries(Object.entries(values).filter(([,value])=>Array.isArray(value)?value.length:typeof value==='string'?value.trim():value!=null).map(([key,value])=>[key,typeof value==='string'?value.trim():value]));
      if(onSubmitted){await onSubmitted(answers);return;}
      const response=await base44.functions.invoke('chatCaseAssistant',{operation:'online_report',input:JSON.stringify(answers)});
      const caseId=`LP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
      sessionStorage.setItem('louosOnlineReport',JSON.stringify({caseId,answers,draft:response.data.result.draft}));
      navigate('/summary');
    }catch(err){setError(err?.response?.data?.error||err.message||'The report could not be prepared. Please try again.');setBusy(false);}
  };
  return <form className="online-report" onSubmit={submit} noValidate lang={language} dir={direction}>
    <header className="online-intro"><p className="online-form-title">{text.formTitle}</p><h1>{text.org}</h1><p><strong>{text.leadStrong}</strong> {text.leadRest}</p></header>
    <label className="online-language"><span><Languages size={22}/>{text.languageLabel}</span><select value={language} onChange={event=>changeLanguage(event.target.value)}>{onlineLanguages.map(item=><option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
    <div className="online-form-vertical">{buildSections(language).map(section=><OnlineReportSection key={section.number} section={section} values={values} errors={errors} onChange={update}/>)}</div>
    {Object.keys(errors).length>0&&<p className="online-error" role="alert">{text.validation.errorSummary}</p>}
    {error&&<p className="online-error" role="alert">{error}</p>}
    <div className="online-actions">
      <button className="mvp-btn online-submit" disabled={busy}>{busy?<><LoaderCircle className="online-spin"/>{text.actions.busy}</>:<>{text.actions.submit} <Send size={22}/></>}</button>
      {cancelPath&&<button type="button" className="online-cancel" onClick={()=>navigate(cancelPath)} disabled={busy}>{text.actions.cancel}</button>}
    </div>
    <button type="button" className={`online-to-top${showTop?' is-visible':''}`} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-hidden={!showTop} tabIndex={showTop?0:-1}><ArrowUp size={24}/>{text.validation.toTop}</button>
  </form>;
}
