import React from 'react';
import {Link,NavLink,Outlet} from 'react-router-dom';
import AssignedCaseAlert from '@/components/employee/AssignedCaseAlert';
import {CheckCircle2,LayoutDashboard,LogOut} from 'lucide-react';
import {useAuth} from '@/lib/AuthContext';
import '@/employee-portal.css';
import '@/assignment-alert.css';
const pages=[['/employee','Dashboard',LayoutDashboard],['/employee/resolved','Previous cases',CheckCircle2]];
export default function MVPShell(){
  const{logout}=useAuth();
  return <div className="mvp mvp-shell">
    <aside className="mvp-side">
      <Link className="mvp-logo" to="/employee">Lou<span>OS</span></Link>
      <nav className="mvp-side-nav" aria-label="Employee portal">
        {pages.map(([path,label,Icon])=><NavLink key={path} to={path} end className={({isActive})=>isActive?'active':''}><Icon size={18}/>{label}</NavLink>)}
      </nav>
      <button type="button" className="mvp-step" title="Sign out" onClick={()=>logout(true)}><LogOut size={16}/>Sign out</button>
    </aside>
    <div className="mvp-content"><Outlet/></div>
    <AssignedCaseAlert/>
  </div>;
}
