import React from 'react';
import {Link,Outlet,useLocation} from 'react-router-dom';
import './portal-flow.css';

export default function PublicPortalShell(){const{pathname}=useLocation();return <div className={`mvp portal-shell ${pathname==='/user'?'portal-home':'portal-flow-shell'}`}><header className="mvp-top"><Link className="mvp-logo" to="/">Lou<span>OS</span></Link><span className="mvp-step">User portal</span></header><Outlet/></div>}
