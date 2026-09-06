import React,{useState} from 'react';
import {Check,ChevronDown,Phone,Mail,Languages,MapPin,Clock,ShieldQuestion} from 'lucide-react';

const eligibilityBadge=status=>{
  if(status==='likely_eligible')return {label:'Likely eligible',tone:'good'};
  if(status==='not_eligible')return {label:'Not eligible',tone:'bad'};
  return {label:'Eligibility needs confirmation',tone:'warn'};
};

export default function ReferralOrgCard({item,selected,onSelect,mode='recommend'}){
  const[open,setOpen]=useState(false);
  const isEmail=(item.contact||'').includes('@');
  const eligibility=eligibilityBadge(item.eligibility);
  return <article className={`employee-referral-card ${selected?'selected':''}`}>
    <header>
      <span className="employee-referral-badge">{item.availability||'Availability not confirmed'}</span>
      {item.openNowLabel&&<span className={`employee-open-badge ${item.openNowStatus}`}><Clock size={12}/>{item.openNowStatus==='open'?'Open now':item.openNowStatus==='closed'?'Closed now':'Hours unknown'}</span>}
    </header>
    <h2>{item.name}</h2>
    <p>{item.service}</p>
    <span className={`employee-eligibility-badge ${eligibility.tone}`}><ShieldQuestion size={13}/>{eligibility.label}</span>
    {mode==='browse'
      ?<div className="employee-why"><strong>Services</strong><ul>{(item.service_types?.length?item.service_types:['Service details not published']).slice(0,4).map((line,i)=><li key={i}>{line}</li>)}</ul></div>
      :<div className="employee-why"><strong>Why this matches</strong><ul>{(item.why?.length?item.why:[item.reason]).filter(Boolean).map((line,i)=><li key={i}>{line}</li>)}</ul></div>}
    <p className="employee-capacity-note">{item.capacityNote||'Capacity not published — contact provider to confirm.'}</p>
    <button type="button" className="employee-more-toggle" onClick={()=>setOpen(o=>!o)}>{open?'Hide details':'More details'}<ChevronDown size={14} className={open?'open':''}/></button>
    {open&&<div className="employee-more-details">
      {!!item.locations?.length&&<p><MapPin size={14}/>{item.locations.join(', ')}</p>}
      {!!item.languages?.length&&<p><Languages size={14}/>{item.languages.join(', ')}</p>}
      {item.contact&&<p>{isEmail?<Mail size={14}/>:<Phone size={14}/>}{item.contact}</p>}
      {item.referral_method&&<p>Referral method: {item.referral_method}</p>}
      {item.eligibilityReasons?.length>0&&<p className="employee-eligibility-reasons">{item.eligibilityReasons.join(' ')}</p>}
      {item.freshness&&<p className="employee-freshness">{item.freshness}{item.sourceUrl?<> · <a href={item.sourceUrl} target="_blank" rel="noreferrer">Source</a></>:null}</p>}
    </div>}
    <button type="button" className="mvp-btn full" onClick={onSelect}>{selected?<><Check size={17}/>Selected</>:'Select organisation'}</button>
  </article>;
}
