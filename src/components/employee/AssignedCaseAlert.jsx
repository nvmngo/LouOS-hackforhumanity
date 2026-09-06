import React,{useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {BellRing,BriefcaseBusiness} from 'lucide-react';
import {base44} from '@/api/base44Client';
import {normalizeEmployeeCase} from '@/hooks/useEmployeeCase';
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {employeePortal,isPrototypeEmployee} from '@/lib/employeeSession';

const storageKey=email=>`louos-seen-assignments-${email}`;
const readSeen=email=>{try{return new Set(JSON.parse(localStorage.getItem(storageKey(email))||'[]'));}catch{return new Set();}};

export default function AssignedCaseAlert(){
  const navigate=useNavigate();
  const[employee,setEmployee]=useState(null);
  const[queue,setQueue]=useState([]);
  const current=queue[0]||null;
  useEffect(()=>{
    let active=true;
    let unsubscribe=()=>{};
    const start=async()=>{
      try{
        if(isPrototypeEmployee()){
          const refresh=async()=>{
            const response=await employeePortal('listCases');
            if(!active)return;
            const me=response.data.employee;
            const specialist=response.data.specialist;
            setEmployee({email:me.email,specialistId:specialist.id});
            const unseen=(response.data.cases||[]).filter(item=>!readSeen(me.email).has(item.id)).map(normalizeEmployeeCase);
            setQueue(current=>{
              const nextIds=new Set(unseen.map(item=>item.id));
              return [...current.filter(item=>nextIds.has(item.id)),...unseen.filter(item=>!current.some(existing=>existing.id===item.id))];
            });
          };
          await refresh();
          const poll=window.setInterval(()=>refresh().catch(()=>{}),5000);
          unsubscribe=()=>window.clearInterval(poll);
          return;
        }
        const me=await base44.auth.me();
        const specialists=await base44.entities.Specialist.filter({contact_email:me.email,active:true});
        const specialist=specialists[0];
        if(!active||!specialist)return;
        setEmployee({email:me.email,specialistId:specialist.id});
        const [assigned,reports]=await Promise.all([
          base44.entities.ClientSubmission.filter({assigned_specialist_id:specialist.id,status:'matched'},'-created_date',30),
          base44.entities.EmployeeCaseReport.filter({specialist_email:me.email})
        ]);
        const completed=new Set(reports.map(report=>report.submission_id));
        if(active)setQueue(assigned.filter(item=>!completed.has(item.id)&&!readSeen(me.email).has(item.id)).map(normalizeEmployeeCase));
        const stopSubscription=base44.entities.ClientSubmission.subscribe(event=>{
          const item=event.data;
          const belongsToEmployee=item?.status==='matched'&&item.assigned_specialist_id===specialist.id;
          if(['create','update'].includes(event.type)&&belongsToEmployee){
            setQueue(items=>items.some(existing=>existing.id===event.id)?items:[...items,normalizeEmployeeCase({...item,id:event.id})]);
          }else if(event.type==='delete'||(event.type==='update'&&!belongsToEmployee)){
            setQueue(items=>items.filter(existing=>existing.id!==event.id));
          }
        });
        if(active)unsubscribe=stopSubscription;
        else stopSubscription();
      }catch{
        // The employee portal remains usable if realtime alerts are unavailable.
      }
    };
    start();
    return()=>{active=false;unsubscribe();};
  },[]);

  const acknowledge=()=>{
    if(!current||!employee)return;
    const updated=readSeen(employee.email);
    updated.add(current.id);
    localStorage.setItem(storageKey(employee.email),JSON.stringify([...updated]));
    setQueue(items=>items.slice(1));
  };
  const openCase=()=>{const id=current?.id;acknowledge();if(id)navigate(`/employee/cases/${id}`);};

  return <Dialog open={Boolean(current)} onOpenChange={open=>{if(!open)acknowledge();}}><DialogContent className="employee-assignment-alert"><div className="employee-alert-icon"><BellRing/></div><DialogHeader><DialogTitle>New case assigned to you</DialogTitle><DialogDescription>LouOS matched this client to your experience, availability, and current workload.</DialogDescription></DialogHeader>{current&&<div className="employee-alert-case"><span className={`employee-urgency ${current.urgency}`}>{current.urgency}</span><h3>{current.clientName}</h3><p>{current.mainNeed}</p><small><BriefcaseBusiness size={14}/>{current.caseId}</small></div>}<DialogFooter><button className="mvp-btn light" onClick={acknowledge}>View later</button><button className="mvp-btn" onClick={openCase}>Open case</button></DialogFooter></DialogContent></Dialog>;
}
