import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,CalendarCheck,CheckCircle2} from 'lucide-react';

const resolvedOn=value=>{
  const date=new Date(value||'');
  return Number.isNaN(date.getTime())?'Date not recorded':date.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});
};

export default function ResolvedCaseCard({item}){
  return <Link className="employee-case-card employee-resolved-card" to={`/employee/resolved/${item.id}`}>
    <div className="employee-case-top"><span className={`employee-urgency ${item.urgency}`}>{item.urgency}</span><span className="employee-resolved-flag"><CheckCircle2 size={15}/>Resolved</span></div>
    <h2>{item.clientName}</h2>
    <p>{item.mainNeed}</p>
    {item.categories?.length?<div className="employee-tags">{item.categories.slice(0,3).map(category=><span key={category}>{category}</span>)}</div>:null}
    <footer><span>{item.caseId}</span><span className="employee-resolved-date"><CalendarCheck size={14}/>{resolvedOn(item.resolvedDate)}</span><ArrowRight size={19}/></footer>
  </Link>;
}
