import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import '@/simple-report.css';
import SimpleCaseReport from '@/components/living/SimpleCaseReport';
import SimpleNoteAssistant from '@/components/living/SimpleNoteAssistant';
export default function CaseworkerWork(){const[approved,setApproved]=useState([]);return <main className="sr-page"><div className="sr-wrap"><header className="sr-heading"><div><p>Living Case Report · Fictional demo client</p><h1>Sarah Nguyen</h1><p>Case LP-2026-0251 · Maya Chen · Senior Caseworker · Housing and DFV</p></div><div className="sr-case-badges"><span className="sr-badge">Active case</span><span className="sr-badge high">High urgency</span><span className="sr-badge medium">Housing priority</span></div></header><div className="sr-layout"><SimpleCaseReport approved={approved}/><SimpleNoteAssistant onApprove={item=>setApproved(items=>items.some(x=>x.id===item.id)?items:[...items,item])}/></div><footer className="sr-footer"><Link to="/external-help">Finish caseworker phase <ArrowRight size={15}/></Link></footer></div></main>}