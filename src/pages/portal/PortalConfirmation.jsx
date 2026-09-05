import React from 'react';
import {CheckCircle2} from 'lucide-react';
import {Link,useLocation} from 'react-router-dom';
import ReturnButton from '@/components/portal/ReturnButton';

export default function PortalConfirmation(){const{state}=useLocation();const matched=state?.status==='matched';return <main className="mvp-main portal-flow portal-status"><ReturnButton/><section className="ai-saved"><CheckCircle2/><p className="mvp-kicker">Submission confirmed</p><h1>Thank you. Your form is complete.</h1>{matched?<p>Your suitable specialist is <strong>{state.specialistName}</strong>. The Lou’s Place team will follow up with you.</p>:<p>Your form has been received. Our team will review it and confirm a specialist shortly.</p>}<Link className="mvp-btn" to="/">Return to welcome</Link></section></main>}