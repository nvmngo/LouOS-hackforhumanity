import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { fileUrl } = await req.json();
    if (!fileUrl || typeof fileUrl !== 'string') return Response.json({ error: 'A form image is required.' }, { status: 400 });
    const url = new URL(fileUrl);
    const allowedHosts = ['base44.com', 'base44.app', 'wixstatic.com', 'supabase.co'];
    const isAllowedHost = allowedHosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
    if (url.protocol !== 'https:' || !isAllowedHost) return Response.json({ error: 'Invalid file location.' }, { status: 400 });
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) return Response.json({ error: 'The uploaded image could not be read.' }, { status: 400 });
    const mimeType = (fileResponse.headers.get('content-type') || '').split(';')[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(mimeType)) return Response.json({ error: 'Please upload a JPG, PNG, WEBP, HEIC, or HEIF image.' }, { status: 400 });
    const bytes = new Uint8Array(await fileResponse.arrayBuffer());
    if (bytes.length > 10 * 1024 * 1024) return Response.json({ error: 'The image must be smaller than 10 MB.' }, { status: 400 });
    const base64 = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
    const prompt = `Read this image of a completed handwritten "LOU'S PLACE — CLIENT INTAKE FORM" carefully. The standard form has seven sections. Use the printed labels to associate handwriting, ticks, circles, and marks with the correct field.

Extract these fields section by section:
1. CASE INFORMATION — STAFF USE: Date, case status (New / Active / Follow-up / Closed), and urgency (Low / Medium / High / Immediate). Do not extract the printed Case ID field because an ID is generated after approval.
2. ABOUT YOU: Full name, preferred name, age, preferred language, phone or contact details, safe contact preference, children or dependants, current accommodation, how long the client can stay there, and whether the client is safe there today (Yes / No / Unsure).
3. CURRENT PROBLEMS OR CRISES: Every ticked relevant area and each written Problem 1–3 with its priority. Relevant areas are Housing, Domestic or Family Violence, Safety, Financial, Legal, Health or Wellbeing, Employment, Family or Children, Social Support, and Other.
4. WHAT WOULD YOU LIKE HELP WITH TODAY?: The most important support needed first.
5. YOUR CURRENT SITUATION: Why the client came to Lou's Place, what has been happening recently, and anything needing urgent attention today.
6. IMPORTANT INFORMATION: Other facts that would help staff support the client.
7. CASEWORKER — STAFF USE: Caseworker name, role, and relevant specialisation.

Return JSON with exactly these keys: client_name, preferred_name, age, preferred_language, contact, safe_contact, dependants, accommodation, main_need, problems, key_information, summary.

Map "Full name" to client_name and "What is the most important support you need first?" to main_need. problems must be an array of objects with category, priority, description. Use the printed relevant-area label as category where possible. Preserve "Immediate" urgency when visible; otherwise priority must be High, Medium, or Low. Put form details that have no dedicated JSON key into key_information as short factual strings prefixed by their printed label, including Date, Case status, Urgency, accommodation duration, safe today response, why the client came, recent events, urgent attention, important information, caseworker name, role, and specialisation.

summary must be a concise 3–6 sentence case description covering why the client came, current accommodation and safety, dependants, major problems, urgent concerns, immediate priority, and requested support. Extract only information actually visible in handwriting or marked choices. Never guess, infer, complete blank fields, or treat printed form text as a client response. If handwriting or a mark is unclear, use an empty string or omit that fact from key_information; use empty arrays when no items are readable.`;
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secrets.get('OPENAI_API_KEY')}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: [
          { type: 'text', text: prompt + '\nReturn only valid JSON.' },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
        ] }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 2000
      })
    });
    const result = await openAiResponse.json();
    if (!openAiResponse.ok) return Response.json({ error: result?.error?.message || 'OpenAI could not analyse this image.' }, { status: 502 });
    const text = result?.choices?.[0]?.message?.content;
    if (!text) return Response.json({ error: 'No readable information was found.' }, { status: 422 });
    return Response.json({ analysis: JSON.parse(text) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'OpenAI image analysis failed.' }, { status: 500 });
  }
}