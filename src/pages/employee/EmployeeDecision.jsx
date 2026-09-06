import React from 'react';
import {Link,useParams} from 'react-router-dom';
import ReturnButton from '@/components/portal/ReturnButton';
import {Building2,FileCheck2} from 'lucide-react';
import useEmployeeCase from '@/hooks/useEmployeeCase';
export default function EmployeeDecision(){const{caseId}=useParams();const{loading,error}=useEmployeeCase(caseId);if(loading)return <main className="mvp-main"><div className="employee-empty">Loading…</div></main>;if(error)return <main className="mvp-main"><div className="employee-empty">{error}</div></main>;return <main className="mvp-main decision employee-decision"><ReturnButton variant="inline" to={`/employee/cases/${caseId}`} label="Back to the case workspace"/><p className="mvp-kicker">Next step</p><h1>External support?</h1><div className="decision-grid"><Link className="decision-card" to={`/employee/cases/${caseId}/final?external=no`}><FileCheck2/><h2>No</h2><p>Save final report</p></Link><Link className="decision-card" to={`/employee/cases/${caseId}/referrals`}><Building2/><h2>Yes</h2><p>Find organisations</p></Link></div></main>}
