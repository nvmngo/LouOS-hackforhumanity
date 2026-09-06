import React,{useEffect,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {ArrowLeft,ArrowRight,Send,ShieldCheck,Loader2,ChevronDown,Phone,Search} from 'lucide-react';
import {base44} from '@/api/base44Client';
import useEmployeeCase from '@/hooks/useEmployeeCase';
import {CaseSnapshot} from '@/components/employee/EmployeeCaseReport';
import ReferralOrgCard from '@/components/employee/referral/ReferralOrgCard';
import {REFERRAL_CATEGORIES,createReferralRecord,upsertReferral,referralHistoryEntry} from '@/lib/referral';

const STEP_LABELS=['Confirm need','Finding services','Recommended services','Confirm plan','Referral action'];
const dependantsPresent=value=>{const t=(value||'').trim().toLowerCase();return Boolean(t)&&!['no','none','nil','n/a'].includes(t);};
const CALL_OUTCOMES=['Referral accepted','Service unavailable','Client not eligible','No answer','Call back required','Other'];
const WHAT_TO_ASK=['Can you assist this client?','Is the client eligible?','Is support currently available?','What are the next steps?','Is any additional documentation required?'];
const eligibilityLabel=status=>status==='likely_eligible'?'Likely eligible':status==='not_eligible'?'Not eligible':'Needs confirmation during call';

export default function EmployeeReferrals(){
  const{caseId}=useParams();
  const nav=useNavigate();
  const{data,loading,error:caseError}=useEmployeeCase(caseId);
  const[me,setMe]=useState(null);
  const[report,setReport]=useState(null);
  const[step,setStep]=useState(0);
  const[category,setCategory]=useState('');
  const[rationale,setRationale]=useState('');
  const[categoryBusy,setCategoryBusy]=useState(false);
  const[recommendations,setRecommendations]=useState([]);
  const[sourceLabel,setSourceLabel]=useState('');
  const[searchError,setSearchError]=useState('');
  const[selectedOrg,setSelectedOrg]=useState(null);
  const[reason,setReason]=useState('');
  const[consentChecked,setConsentChecked]=useState(false);
  const[referral,setReferral]=useState(null);
  const[emailSubject,setEmailSubject]=useState('');
  const[emailBody,setEmailBody]=useState('');
  const[emailBusy,setEmailBusy]=useState(false);
  const[emailApproved,setEmailApproved]=useState(false);
  const[sendBusy,setSendBusy]=useState(false);
  const[sendError,setSendError]=useState('');
  const[actionError,setActionError]=useState('');
  const[excluded,setExcluded]=useState([]);
  const[showExcluded,setShowExcluded]=useState(false);
  const[markBusy,setMarkBusy]=useState(false);
  const[view,setView]=useState('landing');
  const[browseQuery,setBrowseQuery]=useState('');
  const[browseResults,setBrowseResults]=useState([]);
  const[browseBusy,setBrowseBusy]=useState(false);
  const[browseError,setBrowseError]=useState('');
  const[browseSourceLabel,setBrowseSourceLabel]=useState('');
  const[browseSearched,setBrowseSearched]=useState(false);
  const[phoneStage,setPhoneStage]=useState('confirm');
  const[callOutcome,setCallOutcome]=useState('');
  const[callNotes,setCallNotes]=useState('');

  useEffect(()=>{base44.auth.me().then(setMe).catch(()=>{});},[]);
  useEffect(()=>{if(data)setReport(data.report);},[data]);

  useEffect(()=>{
    if(!data||!report)return;
    let active=true;
    setCategoryBusy(true);
    base44.functions.invoke('suggestReferralCategory',{
      primaryNeed:report.supportNeeds.primaryNeed,
      secondaryNeeds:report.supportNeeds.secondaryNeeds,
      safetyLevel:report.safety.level
    }).then(response=>{
      if(!active)return;
      setCategory(response.data.suggestedCategory);
      setRationale(response.data.rationale||'');
    }).catch(e=>{if(active)setSearchError(e?.response?.data?.error||e.message);}).finally(()=>{if(active)setCategoryBusy(false);});
    return()=>{active=false;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[data]);

  const persist=async(nextReport,historyEntry)=>{
    const history=[...(data.reportHistory||[]),historyEntry];
    await base44.entities.ClientSubmission.update(data.id,{case_report:nextReport,report_history:history,report_version:(data.reportVersion||1)+1});
    setReport(nextReport);
    return nextReport;
  };

  const findServices=async()=>{
    setStep(1);setSearchError('');
    try{
      const response=await base44.functions.invoke('recommendOrganizations',{
        category,
        primaryNeed:report.supportNeeds.primaryNeed,
        secondaryNeeds:report.supportNeeds.secondaryNeeds,
        urgency:data.urgency,
        language:report.caseOverview.preferredLanguage,
        age:report.clientInformation.age,
        dependantsPresent:dependantsPresent(report.clientInformation.dependants)
      });
      setRecommendations(response.data.recommendations||[]);
      setExcluded(response.data.excluded||[]);
      setSourceLabel(response.data.dataSourceLabel||'');
      if(response.data.message)setSearchError(response.data.message);
      setStep(2);
    }catch(e){setSearchError(e?.response?.data?.error||e.message||'Organisations could not be found.');setStep(2);}
  };

  const chooseOrg=org=>{
    setSelectedOrg(org);
    setReason(org.reason||(org.why||[]).join('. ')||(org.service_types||[]).join(', '));
    setConsentChecked(false);
    setView('wizard');
    setStep(3);
  };

  const runBrowse=async query=>{
    setBrowseBusy(true);setBrowseError('');setBrowseSearched(true);
    try{
      const response=await base44.functions.invoke('browseServiceDirectory',{
        query,
        secondaryNeeds:report.supportNeeds.secondaryNeeds,
        age:report.clientInformation.age,
        dependantsPresent:dependantsPresent(report.clientInformation.dependants)
      });
      setBrowseResults(response.data.results||[]);
      setBrowseSourceLabel(response.data.dataSourceLabel||'');
    }catch(e){setBrowseError(e?.response?.data?.error||e.message||'The service directory could not be loaded.');}
    finally{setBrowseBusy(false);}
  };

  const confirmPlan=async()=>{
    if(!consentChecked)return;
    setActionError('');
    const record={...createReferralRecord({organization:selectedOrg,category:category||selectedOrg.service_types?.[0]||'',reason,why:selectedOrg.why}),
      consent:`Confirmed by ${me?.full_name||me?.email||'employee'} at ${new Date().toLocaleString()}`,
      referralDate:new Date().toISOString().slice(0,10),
      status:'Selected'};
    try{
      const nextReport={...report,referrals:upsertReferral(report.referrals,record)};
      await persist(nextReport,referralHistoryEntry({referral:record,previousStatus:'Suggested',employee:me?.email}));
      setReferral(record);
      setPhoneStage('confirm');
      setCallOutcome('');
      setCallNotes('');
      setStep(4);
      if((selectedOrg.referral_method_type||'email')!=='phone')draftEmail(record);
    }catch(e){setActionError(e.message||'The referral could not be saved.');}
  };

  const draftEmail=async(record)=>{
    setEmailBusy(true);setActionError('');
    try{
      const response=await base44.functions.invoke('draftReferralEmail',{
        organisationName:selectedOrg.name,category,service:record.service,reason,
        primaryNeed:report.supportNeeds.primaryNeed,agreedSolution:report.supportPlan.agreedSolution,
        urgency:data.urgency,consentConfirmed:true,
        specialistName:me?.full_name||'',specialistEmail:me?.email||''
      });
      setEmailSubject(response.data.subject);
      setEmailBody(response.data.body);
    }catch(e){setActionError(e?.response?.data?.error||e.message||'The email could not be drafted.');}
    finally{setEmailBusy(false);}
  };

  const approveEmail=async()=>{
    setActionError('');
    const updated={...referral,status:'Draft prepared',email_subject:emailSubject,email_body:emailBody};
    try{
      const nextReport={...report,referrals:upsertReferral(report.referrals,updated)};
      await persist(nextReport,referralHistoryEntry({referral:updated,previousStatus:'Selected',employee:me?.email}));
      setReferral(updated);
      setEmailApproved(true);
    }catch(e){setActionError(e.message||'The draft could not be saved.');}
  };

  const send=async()=>{
    setSendBusy(true);setSendError('');
    if(!selectedOrg.contact){setSendError('This organisation has no email on file. Copy the email below and send it through your usual channel.');setSendBusy(false);return;}
    try{
      await base44.functions.invoke('sendReferralEmail',{to:selectedOrg.contact,subject:emailSubject,body:emailBody});
      const updated={...referral,status:'Sent',email_sent_at:new Date().toISOString()};
      const nextReport={...report,referrals:upsertReferral(report.referrals,updated)};
      await persist(nextReport,referralHistoryEntry({referral:updated,previousStatus:'Draft prepared',employee:me?.email}));
      setReferral(updated);
      setStep(5);
    }catch(e){setSendError(e?.response?.data?.error||e.message||'The email could not be sent. The draft has been kept — you can retry or send it manually.');}
    finally{setSendBusy(false);}
  };

  const copyEmail=()=>{navigator.clipboard?.writeText(`Subject: ${emailSubject}\n\n${emailBody}`).catch(()=>{});};

  const buildPhoneSummary=()=>{
    const clientBullets=[];
    if(report.supportNeeds.primaryNeed)clientBullets.push(`Primary need: ${report.supportNeeds.primaryNeed}`);
    if(report.presentingSituation.summary)clientBullets.push(report.presentingSituation.summary);
    if(dependantsPresent(report.clientInformation.dependants))clientBullets.push(`Dependants: ${report.clientInformation.dependants}`);
    if(report.clientInformation.accommodation)clientBullets.push(`Current accommodation: ${report.clientInformation.accommodation}`);
    if(report.supportNeeds.secondaryNeeds?.length)clientBullets.push(`Also involves: ${report.supportNeeds.secondaryNeeds.join(', ')}`);

    const importantBullets=[];
    if(data.urgency)importantBullets.push(`Urgency: ${data.urgency}`);
    const safeContact=report.clientInformation.contactInstructions||report.clientInformation.safeToContact;
    if(safeContact)importantBullets.push(`Safe contact: ${safeContact}`);
    importantBullets.push(referral?.consent?'Client has consented to this referral.':'Client consent not yet confirmed.');

    const requirementBullets=[];
    if(selectedOrg.referral_method)requirementBullets.push(selectedOrg.referral_method);
    requirementBullets.push(`Eligibility: ${eligibilityLabel(selectedOrg.eligibility)}`);
    if(selectedOrg.eligibilityReasons?.length)requirementBullets.push(...selectedOrg.eligibilityReasons);
    requirementBullets.push(`Capacity: ${selectedOrg.capacityNote||'Unknown — ask provider'}`);

    return {clientBullets,importantBullets,requirementBullets};
  };

  const markReferred=async(outcome)=>{
    setMarkBusy(true);setActionError('');
    try{
      const updated={...referral,status:'Sent',email_subject:emailSubject,email_body:emailBody,outcome};
      const nextReport={...report,referrals:upsertReferral(report.referrals,updated)};
      await persist(nextReport,referralHistoryEntry({referral:updated,previousStatus:referral.status,employee:me?.email}));
      setReferral(updated);
      setStep(5);
    }catch(e){setActionError(e.message||'This could not be recorded.');}
    finally{setMarkBusy(false);}
  };

  if(loading||!report)return <main className="mvp-main employee-referrals"><div className="employee-empty">Loading case…</div></main>;
  if(caseError)return <main className="mvp-main employee-referrals"><div className="employee-empty">{caseError}</div></main>;
  if(!report.supportNeeds.primaryNeed)return <main className="mvp-main employee-referrals"><div className="employee-empty">This case has no confirmed support need yet. Complete the specialist consultation before starting a referral.</div></main>;

  return <main className="mvp-main employee-referrals">
    <Link className="employee-icon-back" to={`/staff/cases/${caseId}/decision`} aria-label="Back"><ArrowLeft/></Link>
    <header className="mvp-title"><p className="mvp-kicker">Referral pathway</p><h1>Find external support</h1></header>
    <CaseSnapshot report={report}/>

    {view==='landing'&&<section className="referral-step-panel referral-directory">
      <h2>Find community services across Sydney</h2>
      <p className="survey-note">Search or browse every service currently in the LouOS directory, or go straight to a ranked recommendation for this case.</p>
      <div className="database-search"><Search size={17}/><input placeholder="Search organisations or services…" value={browseQuery} onChange={e=>setBrowseQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')runBrowse(browseQuery);}}/><button type="button" className="mvp-btn" onClick={()=>runBrowse(browseQuery)} disabled={browseBusy}>Search</button></div>
      <div className="phase-actions"><button type="button" className="mvp-btn light" onClick={()=>{setBrowseQuery('');runBrowse('');}} disabled={browseBusy}>Browse all services</button><span/></div>
      {browseBusy&&<p className="survey-note">Loading the service directory…</p>}
      {browseError&&<p className="paper-error">{browseError}</p>}
      {browseSearched&&!browseBusy&&!browseError&&<>
        {browseSourceLabel&&<p className="survey-note">{browseSourceLabel} · {browseResults.length} service{browseResults.length===1?'':'s'}</p>}
        {browseResults.length
          ?<section className="referral-grid">{browseResults.map(item=><ReferralOrgCard key={item.id} item={item} mode="browse" selected={selectedOrg?.id===item.id} onSelect={()=>chooseOrg(item)}/>)}</section>
          :<p className="survey-note">No services match that search.</p>}
      </>}
      <div className="referral-directory-cta">
        <h3>Find services for this case</h3>
        <p className="survey-note">Let LouOS suggest a category from the approved case and rank the best 3 matches.</p>
        <button type="button" className="mvp-btn full" onClick={()=>setView('wizard')}>Find services for this case <ArrowRight size={17}/></button>
      </div>
    </section>}

    {view==='wizard'&&<><div className="referral-steps">{STEP_LABELS.map((label,i)=><span key={label} className={i===step?'active':i<step?'done':''}>{label}</span>)}</div>

    {step===0&&<section className="referral-step-panel">
      <button type="button" className="employee-more-toggle" onClick={()=>setView('landing')}><ArrowLeft size={14}/>Back to service directory</button>
      <h2>What support are we looking for?</h2>
      <p className="survey-note">{categoryBusy?'Reviewing the approved case information…':rationale||'Confirm the service category before we search for organisations.'}</p>
      <select className="employee-select" value={category} onChange={e=>setCategory(e.target.value)} disabled={categoryBusy}>
        <option value="" disabled>Choose a category</option>
        {REFERRAL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
      <div className="phase-actions"><span/><button className="mvp-btn" disabled={!category||categoryBusy} onClick={findServices}>Find suitable services <ArrowRight size={17}/></button></div>
    </section>}

    {step===1&&<section className="referral-step-panel referral-loading"><Loader2 className="spin" size={28}/><p>Finding suitable services for {category}…</p></section>}

    {step===2&&<section className="referral-step-panel">
      <h2>Recommended services</h2>
      {sourceLabel&&<p className="survey-note">{sourceLabel}</p>}
      {searchError&&<p className="paper-error">{searchError}</p>}
      {!!recommendations.length&&<section className="referral-grid">{recommendations.map(item=><ReferralOrgCard key={item.id} item={item} selected={selectedOrg?.id===item.id} onSelect={()=>chooseOrg(item)}/>)}</section>}
      {!!excluded.length&&<div className="referral-excluded"><button type="button" className="employee-more-toggle" onClick={()=>setShowExcluded(o=>!o)}>{excluded.length} service{excluded.length>1?'s':''} excluded on eligibility<ChevronDown size={14} className={showExcluded?'open':''}/></button>{showExcluded&&<ul>{excluded.map(item=><li key={item.id}><b>{item.name}</b> — {item.reason}</li>)}</ul>}</div>}
      <div className="phase-actions"><button className="mvp-btn light" onClick={()=>setStep(0)}>Choose a different category</button><span/></div>
    </section>}

    {step===3&&selectedOrg&&<section className="referral-step-panel">
      <h2>Confirm referral plan</h2>
      <div className="referral-plan-card">
        <p><span>Organisation</span><b>{selectedOrg.name}</b></p>
        <p><span>Service</span><b>{selectedOrg.service}</b></p>
        <label className="employee-select-label">Reason for referral<textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3}/></label>
      </div>
      <label className="consent"><input type="checkbox" checked={consentChecked} onChange={e=>setConsentChecked(e.target.checked)}/>The client has given consent for this referral and for the information in the referral email to be shared with this organisation.</label>
      {actionError&&<p className="paper-error">{actionError}</p>}
      <div className="phase-actions"><button className="mvp-btn light" onClick={()=>setStep(2)}>Back</button><button className="mvp-btn" disabled={!consentChecked} onClick={confirmPlan}>Confirm plan <ArrowRight size={17}/></button></div>
    </section>}

    {step===4&&referral&&selectedOrg&&(()=>{
      const methodType=selectedOrg.referral_method_type||'email';

      if(methodType==='phone'){
        const summary=phoneStage==='summary'?buildPhoneSummary():null;
        return <section className="referral-step-panel">
          {phoneStage==='confirm'&&<>
            <h2>Confirm phone referral</h2>
            <div className="referral-plan-card">
              <p><span>Organisation</span><b>{selectedOrg.name}</b></p>
              <p><span>Phone</span><b>{selectedOrg.contact||'Not on file'}</b></p>
              <p><span>Referral method</span><b>Phone</b></p>
              {selectedOrg.referral_notes&&<p><span>Important instructions</span><b>{selectedOrg.referral_notes}</b></p>}
            </div>
            {actionError&&<p className="paper-error">{actionError}</p>}
            <div className="phase-actions"><button className="mvp-btn light" onClick={()=>setStep(3)}>Back</button><button className="mvp-btn" onClick={()=>setPhoneStage('summary')}>Confirm and prepare call <ArrowRight size={17}/></button></div>
          </>}
          {phoneStage==='summary'&&<>
            <h2>Phone referral summary</h2>
            <p className="survey-note">A quick reference for the call — not a script.</p>
            <div className="phone-call-guide">
              <div className="phone-call-row"><span>Service</span><b>{selectedOrg.name}</b></div>
              <div className="phone-call-row"><span>Phone</span><b>{selectedOrg.contact||'Not on file'}</b></div>
              <div className="phone-call-row"><span>Referral reason</span><b>{reason||'Not recorded'}</b></div>
              <h3>Client summary</h3><ul>{summary.clientBullets.map((line,i)=><li key={i}>{line}</li>)}</ul>
              <h3>Client goal</h3><p>{report.clientGoals.immediateGoal||report.supportNeeds.clientPriority||'Not recorded'}</p>
              <h3>Important information</h3><ul>{summary.importantBullets.map((line,i)=><li key={i}>{line}</li>)}</ul>
              <h3>Service requirements</h3><ul>{summary.requirementBullets.map((line,i)=><li key={i}>{line}</li>)}</ul>
              <h3>What to ask</h3><ul>{WHAT_TO_ASK.map((line,i)=><li key={i}>{line}</li>)}</ul>
            </div>
            <div className="phone-call-outcome">
              <label className="employee-select-label">Call outcome
                <select className="employee-select" value={callOutcome} onChange={e=>setCallOutcome(e.target.value)}>
                  <option value="" disabled>Choose an outcome</option>
                  {CALL_OUTCOMES.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="employee-select-label">Notes (optional)<textarea value={callNotes} onChange={e=>setCallNotes(e.target.value)} rows={2}/></label>
            </div>
            {actionError&&<p className="paper-error">{actionError}</p>}
            <div className="phase-actions">
              <button className="mvp-btn light" onClick={()=>setPhoneStage('confirm')}>Back</button>
              <button className="mvp-btn" disabled={!callOutcome||markBusy} onClick={()=>markReferred(`${callOutcome}${callNotes?`: ${callNotes}`:''}`)}><Phone size={17}/>{markBusy?'Saving…':'Mark as referred by phone'}</button>
            </div>
          </>}
        </section>;
      }

      return <section className="referral-step-panel">
      {methodType==='email'&&<><h2>Referral email</h2><p className="survey-note">Review and edit before sending. Nothing is sent until you click Send.</p></>}
      {(methodType==='online_form'||methodType==='in_person')&&<><h2>{methodType==='online_form'?'Online referral form required':'In-person referral'}</h2><p className="survey-note">{methodType==='online_form'?'This service requires its own online referral form — we can\'t submit it for you.':'This service requires an in-person or direct referral — we can\'t submit it for you.'} {selectedOrg.referral_url?<a href={selectedOrg.referral_url} target="_blank" rel="noreferrer">Open the referral form</a>:'Use the contact details below to arrange the referral.'} Then confirm below once it's done.</p></>}
      {emailBusy?<p className="survey-note">Preparing a case summary…</p>:<div className="referral-email-draft">
        <label>{methodType==='email'?'Subject':'Reference subject'}<input value={emailSubject} onChange={e=>setEmailSubject(e.target.value)}/></label>
        <label>{methodType==='email'?'Body':'Summary to use when you make contact'}<textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} rows={12}/></label>
      </div>}
      {actionError&&<p className="paper-error">{actionError}</p>}
      {sendError&&<p className="paper-error">{sendError} <button type="button" className="employee-more-toggle" onClick={copyEmail}>Copy email</button></p>}
      <div className="phase-actions">
        <button className="mvp-btn light" onClick={()=>setStep(3)}>Back</button>
        {methodType==='email'
          ?(!emailApproved
            ?<button className="mvp-btn" disabled={emailBusy||!emailSubject} onClick={approveEmail}>Approve draft</button>
            :<button className="mvp-btn" disabled={sendBusy} onClick={send}>{sendBusy?'Sending…':<><Send size={17}/>Send referral</>}</button>)
          :<button className="mvp-btn" disabled={emailBusy||markBusy} onClick={()=>markReferred('Referred via provider\'s own process')}><Phone size={17}/>{markBusy?'Saving…':'Mark as referred'}</button>}
      </div>
    </section>;
    })()}

    {step===5&&<section className="referral-step-panel referral-done"><ShieldCheck size={34}/><h2>Referral sent</h2><p>{selectedOrg.name} has been recorded as the referral for this case.</p>
      <div className="phase-actions"><span/><Link className="mvp-btn" to={`/staff/cases/${caseId}/final?external=yes`}>Continue to final report <ArrowRight size={17}/></Link></div>
    </section>}
    </>}
  </main>;
}
