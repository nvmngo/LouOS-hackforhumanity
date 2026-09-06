import {useEffect,useState} from 'react';
import {Outlet} from 'react-router-dom';
import {base44} from '@/api/base44Client';
import {useAuth} from '@/lib/AuthContext';
import {employeePortal,isPrototypeEmployee} from '@/lib/employeeSession';

export default function EmployeeAccessRoute(){
  const{user,logout}=useAuth();
  const[status,setStatus]=useState('loading');

  useEffect(()=>{
    let active=true;
    const verify=async()=>{
      try{
        if(isPrototypeEmployee()){
          await employeePortal('session');
          if(active)setStatus('allowed');
        }else{
          const employee=user||await base44.auth.me();
          const specialists=await base44.entities.Specialist.filter({contact_email:employee.email,active:true});
          if(active)setStatus(specialists[0]?'allowed':'denied');
        }
      }catch{
        if(active)setStatus('denied');
      }
    };
    verify();
    return()=>{active=false;};
  },[user]);

  if(status==='loading')return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"/></div>;
  if(status==='denied')return <main className="mvp-main"><section className="employee-empty"><h1>Employee access is not configured</h1><p>This account is authenticated, but it is not linked to an active specialist profile.</p><button className="mvp-btn" onClick={()=>logout(true)}>Sign out</button></section></main>;
  return <Outlet/>;
}
