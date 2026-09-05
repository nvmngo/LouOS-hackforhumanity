import React from 'react';
import { Link,Outlet,useLocation } from 'react-router-dom';
const labels={'/survey':'Choose a survey','/summary':'Intake summary','/casework':'Caseworker work','/external-help':'External support','/referral-mvp':'Referral','/final-report':'Final report'};
export default function MVPShell(){const path=useLocation().pathname;return <div className="mvp"><header className="mvp-top"><Link className="mvp-logo" to="/">Lou<span>OS</span></Link><span className="mvp-step">{labels[path]||'Lou’s Place · Demo data only'}</span></header><Outlet/></div>}