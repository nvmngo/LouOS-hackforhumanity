import React from 'react';
import {ChevronDown} from 'lucide-react';
import StatusTag from '@/components/living/StatusTag';
export const Field=({label,value,wide=false,full=false,state})=><div className={`lr-field ${wide?'wide':''} ${full?'full':''}`}><span>{label}</span><b>{value||'Not recorded'}</b>{state&&<StatusTag tone={state==='Pending confirmation'?'gold':''}>{state}</StatusTag>}</div>;
export default function ReportSection({id,title,subtitle,state='Verified',children,open=false}){return <details className="lr-section" id={id} open={open}><summary><h3>{title}</h3><p>{subtitle}</p><StatusTag tone={state.includes('Pending')?'gold':state.includes('AI')?'orange':''}>{state}</StatusTag><ChevronDown/></summary><div className="lr-section-body">{children}</div></details>}