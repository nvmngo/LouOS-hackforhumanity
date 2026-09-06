import React,{useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Search} from 'lucide-react';
import ResolvedCaseCard from '@/components/employee/ResolvedCaseCard';
import {fetchResolvedCases} from '@/lib/resolvedCases';

export default function EmployeeResolvedCases(){
  const[employee,setEmployee]=useState(null);
  const[cases,setCases]=useState([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState('');
  const[query,setQuery]=useState('');
  useEffect(()=>{
    let active=true;
    fetchResolvedCases()
      .then(result=>{if(!active)return;setEmployee(result.employee);setCases(result.cases);setError('');})
      .catch(loadError=>{if(active)setError(loadError?.response?.data?.error||loadError.message||'Previous cases could not be loaded.');})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[]);
  const visible=useMemo(()=>{
    const search=query.trim().toLowerCase();
    if(!search)return cases;
    return cases.filter(item=>[item.clientName,item.caseId,item.mainNeed,item.summary,...(item.categories||[])].some(value=>String(value||'').toLowerCase().includes(search)));
  },[cases,query]);
  return <main className="mvp-main employee-dashboard employee-resolved">
    <header>
      <div><p className="mvp-kicker">Dashboard</p><h1>Previous cases</h1><p>{employee?.full_name||'Specialist'} · resolved and finalised</p></div>
      <div className="employee-workload"><span className="employee-count resolved"><CheckCircle2 size={18}/>{cases.length}</span></div>
    </header>
    <label className="employee-search"><Search size={18}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search by client, case ID or support need"/></label>
    {loading?<div className="employee-empty">Loading…</div>
      :error?<div className="employee-empty">{error}</div>
      :visible.length?<section className="employee-case-grid">{visible.map(item=><ResolvedCaseCard key={item.id} item={item}/>)}</section>
      :<div className="employee-empty">{query?'No resolved cases match this search.':'No resolved cases yet. Cases appear here once you save their structured report.'}</div>}
  </main>;
}
