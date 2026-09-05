import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import '@/living-report.css';
import CaseHeader from '@/components/living/CaseHeader';
import CaseSideNav from '@/components/living/CaseSideNav';
import ImmediateOverview from '@/components/living/ImmediateOverview';
import CoreReportSections from '@/components/living/CoreReportSections';
import ActivitySections from '@/components/living/ActivitySections';
import NoteAssistant from '@/components/living/NoteAssistant';
export default function CaseworkerWork(){const[approved,setApproved]=useState(false);return <div className="lr-page"><CaseHeader/><div className="lr-layout"><CaseSideNav/><main className="lr-content"><div className="lr-content-title"><div><h2>Living Case Report</h2><p>Structured current record · Fictional demo data</p></div>{approved&&<span className="lr-state">Report updated · Maya Chen</span>}</div><ImmediateOverview/><CoreReportSections approved={approved}/><ActivitySections/><div className="lr-end"><Link to="/external-help">End caseworker phase <ArrowRight size={14}/></Link></div></main><NoteAssistant onApprove={()=>setApproved(true)}/></div></div>}