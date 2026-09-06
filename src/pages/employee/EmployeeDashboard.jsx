import React,{useEffect,useState} from 'react';
import {BriefcaseBusiness} from 'lucide-react';
import {base44} from '@/api/base44Client';
import ReturnButton from '@/components/portal/ReturnButton';
import {normalizeEmployeeCase} from '@/hooks/useEmployeeCase';
import CaseCard from '@/components/employee/CaseCard';
import {employeePortal,isPrototypeEmployee} from '@/lib/employeeSession';
export default function EmployeeDashboard(){
  const[user,setUser]=useState(null);
  const[specialist,setSpecialist]=useState(null);
  const[cases,setCases]=useState([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    const unsubscribers=[];
    const load=async()=>{
      try{
        if(isPrototypeEmployee()){
          const refresh=async()=>{
            const response=await employeePortal('listCases');
            if(!active)return;
            setUser(response.data.employee);
            setSpecialist(response.data.specialist);
            setCases((response.data.cases||[]).map(normalizeEmployeeCase));
            setError('');
            setLoading(false);
          };
          await refresh();
          const poll=window.setInterval(()=>refresh().catch(()=>{}),5000);
          unsubscribers.push(()=>window.clearInterval(poll));
          return;
        }
        const me=await base44.auth.me();
        setUser(me);
        const specialists=await base44.entities.Specialist.filter({contact_email:me.email,active:true});
        let assigned=[];
        if(specialists[0]){
          const assignedSpecialist=specialists[0];
          setSpecialist(assignedSpecialist);
          const[submissions,reports]=await Promise.all([
            base44.entities.ClientSubmission.filter({assigned_specialist_id:assignedSpecialist.id,status:'matched'},'-created_date',30),
            base44.entities.EmployeeCaseReport.filter({specialist_email:me.email})
          ]);
          const done=new Set(reports.map(report=>report.submission_id));
          assigned=submissions.filter(item=>!done.has(item.id)).map(normalizeEmployeeCase);
          const unsubscribeSubmissions=base44.entities.ClientSubmission.subscribe(event=>{
            const item=event.data;
            const belongsToEmployee=item?.status==='matched'&&item.assigned_specialist_id===assignedSpecialist.id;
            if(['create','update'].includes(event.type)&&belongsToEmployee){
              setCases(current=>current.some(existing=>existing.id===event.id)?current:[normalizeEmployeeCase({...item,id:event.id}),...current]);
            }else if(event.type==='delete'||(event.type==='update'&&!belongsToEmployee)){
              setCases(current=>current.filter(existing=>existing.id!==event.id));
            }
          });
          const unsubscribeSpecialist=base44.entities.Specialist.subscribe(event=>{
            if(event.type==='update'&&event.id===assignedSpecialist.id)setSpecialist(current=>({...current,...event.data,id:event.id}));
          });
          if(active){
            unsubscribers.push(unsubscribeSubmissions,unsubscribeSpecialist);
          }else{
            unsubscribeSubmissions();
            unsubscribeSpecialist();
          }
        }else throw new Error('No active specialist profile is linked to this employee account.');
        if(active)setCases(assigned);
      }catch(loadError){
        if(active)setError(loadError.message||'Upcoming cases could not be loaded.');
      }finally{
        if(active)setLoading(false);
      }
    };
    load();
    return()=>{active=false;unsubscribers.forEach(unsubscribe=>unsubscribe());};
  },[]);
  return <main className="mvp-main employee-dashboard"><ReturnButton variant="inline" to="/" label="Back to home"/><header><div><p className="mvp-kicker">Dashboard</p><h1>Upcoming cases</h1><p>{user?.full_name||'Specialist'} · unresolved</p></div><div className="employee-workload">{specialist&&<span className={`employee-congestion ${specialist.congestion_level||'low'}`}>{specialist.upcoming_case_count||0} upcoming · {(specialist.congestion_level||'low').replace('_',' ')}</span>}<span className="employee-count"><BriefcaseBusiness size={18}/>{cases.length}</span></div></header>{loading?<div className="employee-empty">Loading…</div>:error?<div className="employee-empty">{error}</div>:cases.length?<section className="employee-case-grid">{cases.map(item=><CaseCard key={item.id} item={item}/>)}</section>:<div className="employee-empty">No upcoming cases assigned.</div>}</main>;
}
