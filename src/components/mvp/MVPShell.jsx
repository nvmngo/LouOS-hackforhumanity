import React from 'react';
import {Link,NavLink,Outlet} from 'react-router-dom';
import '@/employee-portal.css';
const pages=[['/staff','Dashboard']];
export default function MVPShell(){return <div className="mvp"><header className="mvp-top"><Link className="mvp-logo" to="/staff">Lou<span>OS</span></Link><nav className="mvp-nav" aria-label="Employee portal">{pages.map(([path,label])=><NavLink key={path} to={path} end className={({isActive})=>isActive?'active':''}>{label}</NavLink>)}</nav><span className="mvp-step">Employee</span></header><Outlet/></div>}