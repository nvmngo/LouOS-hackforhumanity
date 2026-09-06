import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getPrototypeEmployee } from '../../shared/prototypeEmployeeAuth.ts';
import { text } from '../../shared/referralPathway.ts';

// Core.SendEmail is a service-role-only integration — it cannot be called
// directly from frontend app-runtime code, only from a backend function.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    let user = null;
    try { user = await base44.auth.me(); } catch { /* Prototype authentication is checked below. */ }
    const prototypeEmployee = user ? null : await getPrototypeEmployee(body, base44.asServiceRole.entities);
    if (!user && !prototypeEmployee) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (prototypeEmployee && body?.caseId) {
      const submission = await base44.asServiceRole.entities.ClientSubmission.get(body.caseId);
      if (!submission || submission.assigned_specialist_id !== prototypeEmployee.specialist.id) return Response.json({ error: 'You are not assigned to this case.' }, { status: 403 });
    }
    const to = text(body?.to, 200);
    const subject = text(body?.subject, 200);
    const emailBody = text(body?.body, 5000);
    if (!to || !to.includes('@')) return Response.json({ error: 'This organisation has no email on file.' }, { status: 400 });
    if (!subject || !emailBody) return Response.json({ error: 'A subject and body are required.' }, { status: 400 });

    await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body: emailBody, from_name: "Lou's Place" });
    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'The email could not be sent.' }, { status: 502 });
  }
}
