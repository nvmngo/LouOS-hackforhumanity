import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {ArrowLeft,Download} from 'lucide-react';
import EmployeeCaseReport from '@/components/employee/EmployeeCaseReport';
import {caseReportSections} from '@/lib/caseReport';
import {fetchResolvedCase} from '@/lib/resolvedCases';

const resolvedOn=value=>{
  const date=new Date(value||'');
  return Number.isNaN(date.getTime())?'Date not recorded':date.toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'});
};

export default function EmployeeResolvedCase(){
  const{reportId}=useParams();
  const[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[downloading,setDownloading]=useState(false);
  useEffect(()=>{
    let active=true;
    fetchResolvedCase(reportId)
      .then(result=>{if(active)setData(result);})
      .catch(loadError=>{if(active)setError(loadError?.response?.data?.error||loadError.message||'This resolved case could not be loaded.');})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[reportId]);
  const download=async()=>{
    setDownloading(true);setError('');
    try{
      const{downloadCaseReportPdf}=await import('@/lib/reportPdf');
      downloadCaseReportPdf({clientName:data.clientName,caseId:data.caseId,specialistName:data.specialistName,status:data.report.caseOverview.status,urgency:data.urgency,sections:caseReportSections(data.report)});
    }catch(pdfError){setError(pdfError?.message||'The report PDF could not be created.');}
    finally{setDownloading(false);}
  };
  if(loading)return <main className="mvp-main employee-resolved-case"><div className="employee-empty">Loading…</div></main>;
  if(!data)return <main className="mvp-main employee-resolved-case"><Link className="employee-icon-back" to="/employee/resolved" aria-label="Back to previous cases"><ArrowLeft/></Link><div className="employee-empty">{error||'Resolved case not found.'}</div></main>;
  return <main className="mvp-main employee-resolved-case">
    <Link className="employee-icon-back" to="/employee/resolved" aria-label="Back to previous cases"><ArrowLeft/></Link>
    <header className="employee-resolved-head">
      <div><p className="mvp-kicker">Resolved case</p><h1>{data.clientName}</h1><p>{data.caseId} · finalised by {data.specialistName||'this specialist'} on {resolvedOn(data.resolvedDate)}</p></div>
      <button className="mvp-btn light" disabled={downloading} onClick={download}><Download size={17}/>{downloading?'Preparing PDF…':'Download PDF'}</button>
    </header>
    {error&&<p className="paper-error">{error}</p>}
    <section className="employee-resolved-meta">
      <div><span>Primary need</span><b>{data.mainNeed}</b></div>
      <div><span>Urgency at closure</span><b>{data.urgency}</b></div>
      <div><span>External support</span><b>{data.externalSupport?'Referred externally':'Handled in house'}</b></div>
      <div><span>Consultation notes</span><b>{data.notes.length} recorded</b></div>
    </section>
    {data.organisations.length?<section className="employee-resolved-referrals"><h2>Referred organisations</h2><ul>{data.organisations.map((organisation,index)=><li key={`${organisation.organization_id||organisation.name}-${index}`}><b>{organisation.name}</b><span>{organisation.service}</span><p>{organisation.reason||'No reason recorded.'}</p></li>)}</ul></section>:null}
    <EmployeeCaseReport caseData={data}/>
  </main>;
}
