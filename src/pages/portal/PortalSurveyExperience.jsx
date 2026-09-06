import React from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import OnlineReportForm from '@/components/mvp/online/OnlineReportForm';
import PaperIntakeAnalyzer from '@/components/mvp/PaperIntakeAnalyzer';
import ReturnButton from '@/components/portal/ReturnButton';

export default function PortalSurveyExperience(){const{mode}=useParams();const navigate=useNavigate();const submit=data=>navigate('/user/matching',{state:{source:mode,data}});if(mode==='online')return <main className="mvp-main portal-flow portal-intake"><ReturnButton to="/user/survey" label="Return to survey selection"/><OnlineReportForm onSubmitted={submit} cancelPath="/user/survey"/></main>;if(mode==='paper')return <main className="mvp-main portal-flow portal-intake"><ReturnButton/><section className="survey-box"><p className="mvp-kicker">Physical form</p><h1>Upload your completed form</h1><p className="survey-note">Use a clear photo or scan, check the information, then submit it securely.</p><PaperIntakeAnalyzer onApproved={submit}/></section></main>;return <main className="mvp-main portal-flow portal-intake"><ReturnButton/><section className="survey-box"><h1>Survey option unavailable</h1><Link className="mvp-btn" to="/user/survey">Return to survey options</Link></section></main>}
