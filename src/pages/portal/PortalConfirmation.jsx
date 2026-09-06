import React from 'react';
import {Check,UserRound} from 'lucide-react';
import {Link,useLocation} from 'react-router-dom';
import ReturnButton from '@/components/portal/ReturnButton';

const confirmationStorageKey='lous-place-confirmation';
const savedConfirmation=()=>{
  try{return JSON.parse(sessionStorage.getItem(confirmationStorageKey)||'null');}catch{return null;}
};

export default function PortalConfirmation(){
  const{state}=useLocation();
  const confirmation=state?.status?state:savedConfirmation();
  const matched=confirmation?.status==='matched'&&confirmation?.specialistName;
  return <main className="mvp-main portal-flow portal-status portal-confirmation"><ReturnButton/><section className="ai-saved" aria-labelledby="confirmation-title">
    <div className="confirmation-mark" aria-hidden="true"><span/><span/><span/><span/><span/><span/><div><Check/></div></div>
    {matched?<>
      <p className="mvp-kicker">Application accepted</p>
      <h1 id="confirmation-title">Your application has been accepted.</h1>
      <div className="caseworker-confirmation">
        <div className="caseworker-photo-placeholder" role="img" aria-label={`${matched} profile photo placeholder`}><UserRound/><small>Photo</small></div>
        <p>Your caseworker<strong>{matched}</strong></p>
      </div>
      <p className="confirmation-message">We will notify your caseworker shortly.</p>
      <p className="confirmation-note">A Lou’s Place team member will contact you about the next steps.</p>
    </>:<>
      <p className="mvp-kicker">Application received</p>
      <h1 id="confirmation-title">Thank you. Your form is complete.</h1>
      <p className="confirmation-message">Our team will review your application and confirm a caseworker shortly.</p>
    </>}
    <Link className="mvp-btn" to="/">Return to welcome</Link>
  </section></main>;
}
