import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,Clock3} from 'lucide-react';
export default function CaseCard({item}){return <Link className="employee-case-card" to={`/employee/cases/${item.id}`}><div className="employee-case-top"><span className={`employee-urgency ${item.urgency}`}>{item.urgency}</span><Clock3 size={17}/></div><h2>{item.clientName}</h2><p>{item.mainNeed}</p><footer><span>{item.caseId}</span><ArrowRight size={19}/></footer></Link>}
