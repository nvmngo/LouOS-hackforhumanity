import React,{useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import PaperIntakeAnalyzer from '@/components/mvp/PaperIntakeAnalyzer';
import AIInterview from '@/components/mvp/chatbox/AIInterview';
export default function SurveyExperience(){const{mode}=useParams();if(mode==='paper')return <main className="mvp-main"><section className="survey-box"><p className="mvp-kicker">Paper survey</p><h1>Paper intake</h1><p className="survey-note">Upload the client’s completed handwritten form, review the AI summary, then save it to their documentation.</p><PaperIntakeAnalyzer/></section></main>;
if(mode==='chat')return <AIInterview/>;
return <main className="mvp-main"><section className="survey-box"><div className="progress-line"><span/></div><p className="mvp-kicker" style={{marginTop:20}}>Question 3 of 5</p><h1>What would you like support with?</h1><div className="question-options">{['Housing or accommodation','Financial support','Safety and wellbeing','Family or children'].map(x=><button key={x}>{x}</button>)}</div><Link className="mvp-btn full" to="/summary">Complete survey <ArrowRight/></Link></section></main>}