import React from 'react';
import {FileText,Camera,ArrowRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import ReturnButton from '@/components/portal/ReturnButton';

const modes=[{path:'online',title:'Online form',text:'Complete the intake form directly on this device.',Icon:FileText},{path:'paper',title:'Physical form',text:'Upload a clear photo of your completed paper form.',Icon:Camera}];
export default function PortalSurveyModes(){return <main className="mvp-main"><ReturnButton/><header className="mvp-title"><p className="mvp-kicker">Client survey</p><h1>Choose how to complete your form</h1><p>Both options are private and will be used to find the most suitable specialist.</p></header><section className="mode-grid">{modes.map(({path,title,text,Icon})=><article className="mode-card" key={path}><span className="mode-icon"><Icon/></span><h2>{title}</h2><p>{text}</p><Link className="mvp-btn" to={`/portal/survey/${path}`}>Choose this option <ArrowRight size={17}/></Link></article>)}</section></main>}