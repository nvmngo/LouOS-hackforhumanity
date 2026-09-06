import {useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import {normalizeCaseReport} from '@/lib/caseReport';
import {currentEmployee,employeePortal,isPrototypeEmployee} from '@/lib/employeeSession';

export const normalizeEmployeeCase=record=>{
  // Approved suggestions are materialised into case_report by the review function.
  // reviewed_note_suggestions remains an audit trail and must not be replayed here.
  const report=normalizeCaseReport(record);
  const overview=report.caseOverview;
  const client=report.clientInformation;
  const needs=report.supportNeeds;
  return{
    id:record.id,
    caseId:overview.caseId,
    clientName:client.fullName||'Client',
    preferredName:client.preferredName,
    mainNeed:needs.primaryNeed||'Support need to be confirmed',
    urgency:(overview.urgency||'unknown').toLowerCase(),
    categories:needs.secondaryNeeds,
    summary:report.presentingSituation.summary||'No situation summary recorded.',
    language:overview.preferredLanguage,
    contact:client.phone||client.email,
    safeContact:client.contactInstructions,
    dependants:client.dependants,
    accommodation:client.accommodation,
    createdDate:overview.openedDate,
    assignedSpecialist:overview.assignedSpecialist,
    reportHistory:record.report_history||[],
    reportVersion:record.report_version||1,
    report
  };
};
export default function useEmployeeCase(caseId){const[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');useEffect(()=>{let active=true;const load=async()=>{try{let record;if(isPrototypeEmployee()){record=(await employeePortal('getCase',{caseId})).data.case;}else{const me=await currentEmployee();const specialists=await base44.entities.Specialist.filter({contact_email:me.email,active:true});const specialist=specialists[0];if(!specialist)throw new Error('No active specialist profile is linked to this employee account.');record=await base44.entities.ClientSubmission.get(caseId);if(record.status!=='matched'||record.assigned_specialist_id!==specialist.id)throw new Error('This case is not assigned to you.');}if(active)setData(normalizeEmployeeCase(record));}catch(loadError){if(active)setError(loadError?.response?.data?.error||loadError.message||'Case not found.');}finally{if(active)setLoading(false);}};load();return()=>{active=false;};},[caseId]);return{data,loading,error};}
