import React from 'react';
import {Link,Outlet,useLocation} from 'react-router-dom';

export default function PublicPortalShell(){const{pathname}=useLocation();return <div className={`mvp portal-shell ${pathname==='/'?'portal-home':''}`}><header className="mvp-top"><Link className="mvp-logo" to="/">Lou<span>OS</span></Link><span className="mvp-step">Client portal</span></header><Outlet/></div>}