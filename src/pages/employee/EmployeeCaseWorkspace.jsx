import React,{useMemo,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import ReturnButton from '@/components/portal/ReturnButton';
import {ArrowRight} from 'lucide-react';
import useEmployeeCase from '@/hooks/useEmployeeCase';
import EmployeeCaseReport from '@/components/employee/EmployeeCaseReport';
import EmployeeNoteTaker from '@/components/employee/EmployeeNoteTaker';
import {base44} from '@/api/base44Client';
import {applyReportSuggestions} from '@/lib/caseReport';
import {employeeToken} from '@/lib/employeeSession';

const readSessionReviews=key=>{try{return JSON.parse(sessionStorage.getItem(key)||'[]');}catch{return[];}};

export default function EmployeeCaseWorkspace(){
  const{caseId}=useParams();
  const{data,loading,error}=useEmployeeCase(caseId);
  const key=`employee-case-notes-${caseId}`;
  const[reviews,setReviews]=useState(()=>readSessionReviews(key));
  const workingReport=useMemo(()=>applyReportSuggestions(data?.report,reviews),[data?.report,reviews]);
  const workingCase=data?{...data,report:workingReport}:null;
  const reviewSuggestion=async(suggestion,decision)=>{
    const response=await base44.functions.invoke('reviewCaseNoteSuggestion',{caseId:data.id,decision,employeeToken:employeeToken(),suggestion:{id:suggestion.id,fieldPath:suggestion.fieldPath,section:suggestion.section,label:suggestion.label,operation:suggestion.operation,originalValue:suggestion.originalValue,finalValue:suggestion.finalValue,sourceType:suggestion.sourceType,reason:suggestion.reason,evidence:suggestion.evidence}});
    const review=response.data.review;
    if(review.status!=='rejected')setReviews(current=>{const next=[...current,review];sessionStorage.setItem(key,JSON.stringify(next));return next});
    return review;
  };
  if(loading)return <main className="sr-page"><div className="sr-wrap">Loading…</div></main>;
  if(error)return <main className="sr-page"><div className="sr-wrap">{error}</div></main>;
  return <main className="sr-page"><div className="sr-wrap"><ReturnButton variant="inline" to="/employee" label="Back to the dashboard"/><header className="sr-heading"><div><p>Living case report · Consultation workspace</p><h1>{data.clientName}</h1><p>{data.caseId} · Intake information is shown until specialist updates are approved</p></div><span className={`employee-urgency ${data.urgency}`}>{data.urgency}</span></header><div className="sr-layout"><EmployeeCaseReport caseData={workingCase}/><EmployeeNoteTaker caseData={workingCase} onReview={reviewSuggestion}/></div><footer className="sr-footer"><Link to={`/employee/cases/${caseId}/decision`}>Complete consultation <ArrowRight size={16}/></Link></footer></div></main>;
}
