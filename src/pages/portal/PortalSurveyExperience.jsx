import React from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import OnlineReportForm from '@/components/mvp/online/OnlineReportForm';
import PaperIntakeAnalyzer from '@/components/mvp/PaperIntakeAnalyzer';
import ReturnButton from '@/components/portal/ReturnButton';
import '@/online-report.css';

export default function PortalSurveyExperience(){const{mode}=useParams();const navigate=useNavigate();const submit=data=>navigate('/user/matching',{state:{source:mode,data}});if(mode==='online')return <main className="mvp-main portal-flow portal-intake"><ReturnButton to="/user/survey" label="Return to survey selection"/><OnlineReportForm onSubmitted={submit} cancelPath="/user/survey"/></main>;if(mode==='paper')return <main className="mvp-main portal-flow portal-intake"><ReturnButton to="/user/survey" label="Return to survey selection"/><section className="online-report paper-form"><header className="online-intro"><p className="online-form-title">Paper form</p><h1>Lou’s Place</h1><p><strong>Take a clear photo of your completed form.</strong> Check the details we read from it, then send it to our team.</p></header><PaperIntakeAnalyzer onApproved={submit}/></section></main>;return <main className="mvp-main portal-flow portal-intake"><ReturnButton to="/user/survey" label="Return to survey selection"/><section className="survey-box"><h1>Survey option unavailable</h1><Link className="mvp-btn" to="/user/survey">Return to survey options</Link></section></main>}
