import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { arrayFieldPaths, reviewRequestSchema, safetyLevels } from '../../shared/caseNoteSuggestions.ts';
import { getPrototypeEmployee } from '../../shared/prototypeEmployeeAuth.ts';

export default async function(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({error:'Method not allowed.'},{status:405,headers:{Allow:'POST'}});
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(()=>null);
    let user=null;
    try{user=await base44.auth.me();}catch{/* Prototype authentication is checked below. */}
    const entities = base44.asServiceRole.entities;
    const prototypeEmployee = user ? null : await getPrototypeEmployee(body, entities);
    if (!user && !prototypeEmployee) return Response.json({error:'Unauthorized.'},{status:401});
    const reviewer = user?.email || prototypeEmployee?.email;
    const {employeeToken: _employeeToken, ...reviewBody} = body && typeof body === 'object' ? body : {};
    const parsed = reviewRequestSchema.safeParse(reviewBody);
    if (!parsed.success) return Response.json({error:'This suggestion could not be reviewed safely.'},{status:400});
    const {caseId,decision,suggestion} = parsed.data;
    if (suggestion.fieldPath==='safety.level'&&!safetyLevels.has(suggestion.finalValue)) return Response.json({error:'Choose a supported safety level before approving this update.'},{status:400});
    const [submission,specialists] = await Promise.all([
      entities.ClientSubmission.get(caseId),
      entities.Specialist.filter({contact_email:reviewer,active:true})
    ]);
    if (!submission || !specialists.some((specialist: {id:string})=>specialist.id===submission.assigned_specialist_id)) return Response.json({error:'You are not assigned to this case.'},{status:403});

    const edited = suggestion.finalValue !== suggestion.originalValue;
    const review = {
      id:suggestion.id,
      field_path:suggestion.fieldPath,
      section:suggestion.section,
      label:suggestion.label,
      operation:suggestion.operation,
      source_type:suggestion.sourceType,
      reason:suggestion.reason,
      evidence:suggestion.evidence,
      original_suggestion:suggestion.originalValue,
      final_value:suggestion.finalValue,
      status:decision==='rejected'?'rejected':edited?'edited_and_approved':'approved',
      reviewed_by:reviewer,
      reviewed_at:new Date().toISOString()
    };
    const history = Array.isArray(submission.reviewed_note_suggestions) ? submission.reviewed_note_suggestions : [];
    const existingReview = history.find((item: {id?:string})=>item.id===suggestion.id);
    if (existingReview) return Response.json({review:existingReview});
    const reportHistory = Array.isArray(submission.report_history) ? submission.report_history : [];
    const update: Record<string,unknown> = {reviewed_note_suggestions:[...history,review]};
    if (decision === 'approved') {
      const report = structuredClone(submission.case_report || {});
      const [section,field] = suggestion.fieldPath.split('.');
      let previousValue;
      if (suggestion.fieldPath === 'actions') {
        previousValue = Array.isArray(report.actions) ? report.actions : [];
        report.actions = [...previousValue,{description:suggestion.finalValue,responsiblePerson:'To be confirmed',dueDate:'',status:'To do',outcome:''}];
      } else {
        if (!report[section] || typeof report[section] !== 'object') report[section] = {};
        previousValue = report[section][field];
        report[section][field] = arrayFieldPaths.has(suggestion.fieldPath)
          ? [...(Array.isArray(previousValue) ? previousValue : []),suggestion.finalValue].filter((value,index,values)=>values.indexOf(value)===index)
          : suggestion.finalValue;
      }
      update.case_report = report;
      update.report_version = (Number(submission.report_version) || 1) + 1;
      update.report_history = [...reportHistory,{
        field_path:suggestion.fieldPath,previous_value:previousValue,new_value:suggestion.finalValue,
        source:'Consultation AI extraction',updated_at:review.reviewed_at,approved_by:reviewer,
        suggestion_status:review.status
      }];
    }
    await entities.ClientSubmission.update(caseId,update);
    return Response.json({review});
  } catch {
    return Response.json({error:'The review could not be saved. No report changes were made.'},{status:500});
  }
}
