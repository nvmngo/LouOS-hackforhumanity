import React from 'react';
import {Link,useParams} from 'react-router-dom';
import ReturnButton from '@/components/portal/ReturnButton';
import PaperIntakeAnalyzer from '@/components/mvp/PaperIntakeAnalyzer';
import OnlineReportForm from '@/components/mvp/online/OnlineReportForm';
export default function SurveyExperience(){const{mode}=useParams();if(mode==='paper')return <main className="mvp-main"><ReturnButton variant="inline" to="/survey" label="Back to intake options"/><section className="survey-box"><p className="mvp-kicker">Paper survey</p><h1>Paper intake</h1><p className="survey-note">Upload the client’s completed handwritten form, review the AI summary, then save it to their documentation.</p><PaperIntakeAnalyzer/></section></main>;
if(mode==='online')return <main className="mvp-main"><ReturnButton variant="inline" to="/survey" label="Back to intake options"/><OnlineReportForm/></main>;
return <main className="mvp-main"><ReturnButton variant="inline" to="/survey" label="Back to intake options"/><section className="survey-box"><h1>Intake option unavailable</h1><p className="survey-note">Please choose one of the current intake options.</p><Link className="mvp-btn" to="/survey">Return to intake options</Link></section></main>}