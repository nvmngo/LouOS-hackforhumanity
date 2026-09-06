import {base44} from '@/api/base44Client';
import {normalizeCaseReport} from '@/lib/caseReport';
import {currentEmployee,employeePortal,isPrototypeEmployee} from '@/lib/employeeSession';

// A resolved case is an EmployeeCaseReport finalised by the signed-in
// specialist. The submission it came from stays matched, so the archive reads
// from the finalised report rather than from ClientSubmission.
export const normalizeResolvedCase=record=>{
  const base=normalizeCaseReport(record);
  // The submission stays 'matched' after finalisation, so the archived copy is
  // relabelled here rather than carrying the working status through.
  const report={...base,caseOverview:{...base.caseOverview,status:record.status==='finalised'?'Resolved':base.caseOverview.status}};
  return{
    id:record.id,
    submissionId:record.submission_id,
    caseId:record.case_id||report.caseOverview.caseId,
    clientName:record.client_name||report.clientInformation.fullName||'Client',
    specialistName:record.specialist_name||report.caseOverview.assignedSpecialist||'',
    specialistEmail:record.specialist_email||'',
    mainNeed:record.main_need||report.supportNeeds.primaryNeed||'Support need not recorded',
    urgency:(record.urgency||report.caseOverview.urgency||'unknown').toLowerCase(),
    categories:record.problem_categories?.length?record.problem_categories:report.supportNeeds.secondaryNeeds,
    summary:record.case_summary||report.presentingSituation.summary||'No situation summary recorded.',
    notes:record.interview_notes||[],
    externalSupport:Boolean(record.external_support_needed),
    organisations:record.selected_organizations||[],
    resolvedDate:record.updated_date||record.created_date||'',
    reportText:record.report_text||'',
    report
  };
};

const linkedSpecialist=async email=>{
  const specialists=await base44.entities.Specialist.filter({contact_email:email,active:true});
  if(!specialists[0])throw new Error('No active specialist profile is linked to this employee account.');
  return specialists[0];
};

export const fetchResolvedCases=async()=>{
  if(isPrototypeEmployee()){
    const{data}=await employeePortal('listResolvedCases');
    return{employee:data.employee,specialist:data.specialist,cases:(data.cases||[]).map(normalizeResolvedCase)};
  }
  const me=await currentEmployee();
  const specialist=await linkedSpecialist(me.email);
  const reports=await base44.entities.EmployeeCaseReport.filter({specialist_email:me.email},'-created_date',100);
  return{employee:me,specialist,cases:reports.map(normalizeResolvedCase)};
};

export const fetchResolvedCase=async reportId=>{
  if(isPrototypeEmployee()){
    const{data}=await employeePortal('getResolvedCase',{reportId});
    return normalizeResolvedCase(data.case);
  }
  const me=await currentEmployee();
  const record=await base44.entities.EmployeeCaseReport.get(reportId);
  if(!record||record.specialist_email!==me.email)throw new Error('This resolved case was not finalised by you.');
  return normalizeResolvedCase(record);
};
