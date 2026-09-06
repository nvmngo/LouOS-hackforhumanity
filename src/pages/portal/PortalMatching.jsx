import React,{useEffect,useState} from 'react';
import {Navigate,useLocation,useNavigate} from 'react-router-dom';
import {Check,FileCheck2,LoaderCircle,ScanSearch,UsersRound} from 'lucide-react';
import {base44} from '@/api/base44Client';
import ReturnButton from '@/components/portal/ReturnButton';

const matchingSteps=[
  {label:'Form received securely',Icon:FileCheck2},
  {label:'Structuring your information',Icon:ScanSearch},
  {label:'Reviewing caseworker availability',Icon:UsersRound},
  {label:'Confirming the best match',Icon:Check}
];
const confirmationStorageKey='lous-place-confirmation';

export default function PortalMatching(){
  const{state}=useLocation();
  const navigate=useNavigate();
  const[error,setError]=useState('');
  const[stage,setStage]=useState(0);

  useEffect(()=>{
    if(error)return;
    const timers=[setTimeout(()=>setStage(1),700),setTimeout(()=>setStage(2),1450)];
    return()=>timers.forEach(clearTimeout);
  },[error]);

  useEffect(()=>{
    if(!state?.data)return;
    let active=true;
    const prepare=async()=>{
      let caseReport=null;
      if(state.source==='online'){
        try{
          const analysis=await base44.functions.invoke('chatCaseAssistant',{operation:'online_report',input:JSON.stringify(state.data)});
          caseReport=analysis.data.result.draft;
        }catch{/* Matching still stores a deterministic structured report if AI is unavailable. */}
      }
      const[response]=await Promise.all([
        base44.functions.invoke('matchSpecialist',{...state,caseReport}),
        new Promise(resolve=>setTimeout(resolve,2200))
      ]);
      if(active){
        try{sessionStorage.setItem(confirmationStorageKey,JSON.stringify(response.data));}catch{/* Router state still carries the result when session storage is unavailable. */}
        navigate('/user/confirmation',{replace:true,state:response.data});
      }
    };
    prepare().catch(err=>{if(active)setError(err?.response?.data?.error||err.message||'We could not complete the match.')});
    return()=>{active=false};
  },[state,navigate]);

  if(!state?.data)return <Navigate to="/user/survey" replace/>;
  const progress=[38,68,90][stage];
  return <main className="mvp-main portal-flow portal-status portal-matching"><ReturnButton/><section className="processing" aria-labelledby="matching-title">
    <div className="matcher-visual" aria-hidden="true"><span className="matcher-orbit orbit-one"/><span className="matcher-orbit orbit-two"/><span className="matcher-orbit orbit-three"/><div className="matcher-core"><strong>Lou</strong><small>OS</small></div></div>
    <p className="mvp-kicker">Matching in progress</p>
    <h1 id="matching-title">Finding the right caseworker</h1>
    <p className="matcher-intro">We’re securely preparing your information and checking who is best placed to support you.</p>
    <div className="matcher-progress" role="progressbar" aria-label="Matching progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{width:`${progress}%`}}/></div>
    <ol className="matcher-steps" aria-live="polite">{matchingSteps.map(({label,Icon},index)=>{const status=index===0||index<stage+1?'complete':index===stage+1?'active':'upcoming';return <li className={status} aria-current={status==='active'?'step':undefined} key={label}><span>{status==='complete'?<Check/>:status==='active'?<LoaderCircle className="matcher-spin"/>:<Icon/>}</span><p>{label}</p></li>})}</ol>
    {error&&<div className="matcher-error" role="alert"><strong>We couldn’t finish the match.</strong><p>{error}</p><p>Your form has not been lost. Please return and ask a Lou’s Place team member for help.</p></div>}
  </section></main>;
}
