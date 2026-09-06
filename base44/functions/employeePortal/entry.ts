import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { createPrototypeEmployeeToken, findPrototypeSpecialist, getPrototypeEmployee, verifyPrototypePassword } from '../../shared/prototypeEmployeeAuth.ts';

const clean = (value: unknown, length = 2000) => typeof value === 'string' ? value.trim().slice(0, length) : '';

export default async function(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({error: 'Method not allowed.'}, {status: 405, headers: {Allow: 'POST'}});
  try {
    const base44 = createClientFromRequest(req);
    const entities = base44.asServiceRole.entities;
    const body = await req.json().catch(() => null);
    const action = body?.action;

    if (action === 'login') {
      const email = await verifyPrototypePassword(body?.email, body?.password);
      if (!email) return Response.json({error: 'Invalid email or password.'}, {status: 401});
      const specialist = await findPrototypeSpecialist(email, entities);
      if (!specialist) return Response.json({error: 'Employee access is not configured.'}, {status: 403});
      return Response.json({
        employeeToken: await createPrototypeEmployeeToken(email),
        employee: {email, full_name: specialist.full_name, role: 'employee', specialist_id: specialist.id},
        specialist
      });
    }

    const employee = await getPrototypeEmployee(body, entities);
    if (!employee) return Response.json({error: 'Employee session expired. Please sign in again.'}, {status: 401});
    const publicEmployee = {email: employee.email, full_name: employee.full_name, role: 'employee', specialist_id: employee.specialist.id};

    if (action === 'session') return Response.json({employee: publicEmployee, specialist: employee.specialist});

    if (action === 'listCases') {
      const [submissions, reports] = await Promise.all([
        entities.ClientSubmission.filter({assigned_specialist_id: employee.specialist.id, status: 'matched'}, '-created_date', 30),
        entities.EmployeeCaseReport.filter({specialist_email: employee.email}, '-created_date', 100)
      ]);
      const completed = new Set(reports.map((report: any) => report.submission_id));
      return Response.json({employee: publicEmployee, specialist: employee.specialist, cases: submissions.filter((item: any) => !completed.has(item.id))});
    }

    if (action === 'listResolvedCases') {
      const reports = await entities.EmployeeCaseReport.filter({specialist_email: employee.email}, '-created_date', 100);
      return Response.json({employee: publicEmployee, specialist: employee.specialist, cases: reports});
    }

    if (action === 'getResolvedCase') {
      const reportId = clean(body?.reportId, 100);
      const report = reportId ? await entities.EmployeeCaseReport.get(reportId) : null;
      if (!report || report.specialist_email !== employee.email) {
        return Response.json({error: 'This resolved case was not finalised by you.'}, {status: 403});
      }
      return Response.json({case: report});
    }

    if (action === 'getCase') {
      const caseId = clean(body?.caseId, 100);
      const submission = caseId ? await entities.ClientSubmission.get(caseId) : null;
      if (!submission || submission.status !== 'matched' || submission.assigned_specialist_id !== employee.specialist.id) {
        return Response.json({error: 'This case is not assigned to you.'}, {status: 403});
      }
      return Response.json({case: submission});
    }

    if (action === 'saveFinalReport') {
      const caseId = clean(body?.caseId, 100);
      const submission = caseId ? await entities.ClientSubmission.get(caseId) : null;
      if (!submission || submission.status !== 'matched' || submission.assigned_specialist_id !== employee.specialist.id) {
        return Response.json({error: 'This case is not assigned to you.'}, {status: 403});
      }
      const payload = body?.payload && typeof body.payload === 'object' ? body.payload : null;
      if (!payload || JSON.stringify(payload).length > 100000) return Response.json({error: 'The report is invalid or too large.'}, {status: 400});
      const safePayload = {...payload, submission_id: submission.id, specialist_email: employee.email, specialist_name: employee.full_name, status: 'finalised'};
      const existing = await entities.EmployeeCaseReport.filter({submission_id: submission.id});
      if (existing[0]) await entities.EmployeeCaseReport.update(existing[0].id, safePayload);
      else await entities.EmployeeCaseReport.create(safePayload);
      await entities.ClientSubmission.update(submission.id, {case_report: payload.case_report, report_history: payload.report_history, report_version: payload.report_version || 2});
      const [assigned, finalised] = await Promise.all([
        entities.ClientSubmission.filter({assigned_specialist_id: employee.specialist.id, status: 'matched'}, '-created_date', 5000),
        entities.EmployeeCaseReport.filter({specialist_email: employee.email}, '-created_date', 5000)
      ]);
      const completedIds = new Set(finalised.map((item: any) => item.submission_id));
      const upcoming = assigned.filter((item: any) => !completedIds.has(item.id)).length;
      const maximum = Number(employee.specialist.maximum_caseload) || 0;
      const ratio = maximum > 0 ? upcoming / maximum : 1;
      const congestion = maximum <= 0 || upcoming >= maximum ? 'at_capacity' : ratio >= 0.8 ? 'high' : ratio >= 0.5 ? 'moderate' : 'low';
      await entities.Specialist.update(employee.specialist.id, {upcoming_case_count: upcoming, congestion_level: congestion});
      return Response.json({saved: true});
    }

    return Response.json({error: 'Unsupported employee portal action.'}, {status: 400});
  } catch {
    return Response.json({error: 'The employee portal request could not be completed.'}, {status: 500});
  }
}
