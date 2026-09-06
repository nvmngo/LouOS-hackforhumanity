import React from 'react';
import {Link,NavLink,Outlet} from 'react-router-dom';
import AssignedCaseAlert from '@/components/employee/AssignedCaseAlert';
import {LogOut} from 'lucide-react';
import {useAuth} from '@/lib/AuthContext';
import '@/employee-portal.css';
import '@/assignment-alert.css';
const pages=[['/employee','Dashboard']];
export default function MVPShell(){const{logout}=useAuth();return <div className="mvp"><header className="mvp-top"><Link className="mvp-logo" to="/employee">Lou<span>OS</span></Link><nav className="mvp-nav" aria-label="Employee portal">{pages.map(([path,label])=><NavLink key={path} to={path} end className={({isActive})=>isActive?'active':''}>{label}</NavLink>)}</nav><button type="button" className="mvp-step" aria-label="Sign out" title="Sign out" onClick={()=>logout(true)}><LogOut size={16}/></button></header><Outlet/><AssignedCaseAlert/></div>}
