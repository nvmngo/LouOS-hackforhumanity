import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getPrototypeEmployee } from '../../shared/prototypeEmployeeAuth.ts';
import { optionalSecret } from '../../shared/optionalSecret.ts';
import { text } from '../../shared/referralPathway.ts';

// Builds a plain, safe template without AI. Used when no API key is configured
// or the AI call fails, so drafting a referral email never blocks the employee.
const templateDraft = (input: ReturnType<typeof readInput>) => {
  const greeting = input.organisationName ? `Dear ${input.organisationName} team,` : 'Dear team,';
  const body = [
    greeting,
    '',
    `My name is ${input.specialistName || 'a caseworker'} from Lou's Place. I am writing to refer a client for ${input.service || 'support'}.`,
    '',
    `Reason for referral: ${input.reason || input.primaryNeed || 'Support required, details to follow.'}`,
    input.urgency ? `Urgency: ${input.urgency}.` : '',
    input.agreedSolution ? `Agreed support plan: ${input.agreedSolution}` : '',
    '',
    'The client has consented to this referral and to the information above being shared with your organisation for this purpose.',
    '',
    `Please let us know if you are able to assist, and the next steps for this referral.`,
    '',
    `Kind regards,`,
    input.specialistName || 'Lou\'s Place caseworker',
    input.specialistEmail || ''
  ].filter(line => line !== '').join('\n');
  return { subject: `Referral request — ${input.service || input.category || 'support'} for a Lou's Place client`, body };
};

function readInput(body: any) {
  return {
    organisationName: text(body?.organisationName, 200),
    category: text(body?.category, 100),
    service: text(body?.service, 150),
    reason: text(body?.reason, 800),
    primaryNeed: text(body?.primaryNeed, 300),
    agreedSolution: text(body?.agreedSolution, 500),
    urgency: text(body?.urgency, 40),
    consentConfirmed: Boolean(body?.consentConfirmed),
    specialistName: text(body?.specialistName, 150),
    specialistEmail: text(body?.specialistEmail, 200)
  };
}

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
    const input = readInput(body);
    if (!input.organisationName) return Response.json({ error: 'A selected organisation is required.' }, { status: 400 });
    if (!input.consentConfirmed) return Response.json({ error: 'Client consent must be confirmed before a referral email can be drafted.' }, { status: 400 });

    const fallback = templateDraft(input);
    const apiKey = optionalSecret('OPENAI_API_KEY');
    if (!apiKey) return Response.json({ ...fallback, usingAiDraft: false });

    // Data minimisation: only the fields above are ever sent to the model — no
    // safety notes, health information, or other case sections are included.
    const prompt = `Draft a short, professional referral email from a Lou's Place caseworker to an external support organisation. Use only the facts supplied below; do not invent details. Do not include any information beyond what is given. Keep it concise (under 200 words), warm but professional, and end with a clear next-step request. Return JSON: {"subject":"...","body":"..."}.
Organisation: ${input.organisationName}
Service requested: ${input.service || input.category || 'Support'}
Reason for referral: ${input.reason || input.primaryNeed || 'Not specified'}
Urgency: ${input.urgency || 'Not specified'}
Agreed support plan: ${input.agreedSolution || 'Not yet finalised'}
Client consent: confirmed for this referral and for sharing the above information only
Caseworker name: ${input.specialistName || 'Not provided'}
Caseworker email: ${input.specialistEmail || 'Not provided'}`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.2, max_tokens: 500 })
    });
    if (!aiResponse.ok) return Response.json({ ...fallback, usingAiDraft: false });
    const result = await aiResponse.json();
    const parsed = JSON.parse(result?.choices?.[0]?.message?.content || '{}');
    const subject = text(parsed.subject, 200) || fallback.subject;
    const draftBody = text(parsed.body, 3000) || fallback.body;
    return Response.json({ subject, body: draftBody, usingAiDraft: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Email drafting failed.' }, { status: 500 });
  }
}
