import React from 'react';
import {FileText,Camera} from 'lucide-react';
import {Link} from 'react-router-dom';
import ReturnButton from '@/components/portal/ReturnButton';

const modes=[{path:'online',title:'Online form',text:'Fill in on this device.',Icon:FileText},{path:'paper',title:'Physical form',text:'Upload a clear photo.',Icon:Camera}];
export default function PortalSurveyModes(){return <main className="mvp-main portal-flow portal-survey-modes"><ReturnButton/><header className="mvp-title"><p className="mvp-kicker">Client survey</p><h1>Choose a form</h1><p>Private and secure.</p></header><section className="mode-grid">{modes.map(({path,title,text,Icon})=><Link className="mode-card" key={path} aria-label={`Choose ${title}`} to={`/portal/survey/${path}`}><span className="mode-icon"><Icon/></span><h2>{title}</h2><p>{text}</p></Link>)}</section></main>}