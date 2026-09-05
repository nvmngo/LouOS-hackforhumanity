import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { fileUrl } = await req.json();
    if (!fileUrl || typeof fileUrl !== 'string') return Response.json({ error: 'A PDF file is required.' }, { status: 400 });
    const url = new URL(fileUrl);
    if (url.protocol !== 'https:' || (!url.hostname.endsWith('base44.com') && !url.hostname.endsWith('wixstatic.com'))) return Response.json({ error: 'Invalid file location.' }, { status: 400 });
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) return Response.json({ error: 'The uploaded PDF could not be read.' }, { status: 400 });
    const bytes = new Uint8Array(await fileResponse.arrayBuffer());
    if (bytes.length > 10 * 1024 * 1024) return Response.json({ error: 'The PDF must be smaller than 10 MB.' }, { status: 400 });
    const base64 = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
    const prompt = `Read this single handwritten Lou's Place intake form carefully. Extract only information visible in the form; never invent missing facts. Return JSON with these exact keys: client_name, preferred_name, age, preferred_language, contact, safe_contact, dependants, accommodation, main_need, problems, key_information, summary. problems is an array of objects with category, priority, description. Use only relevant categories from Housing, Domestic / Family Violence, Safety, Financial, Legal, Health / Wellbeing, Employment, Family / Children, Social Support, Other. priority must be High, Medium, or Low. key_information is an array of short factual bullet strings. summary must be a concise 3–6 sentence case description covering why the client came, current circumstances, major problems, dependants/context, immediate priority, and requested support. Use an empty string or empty array when handwriting is unreadable or information is missing.`;
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': secrets.get('GEMINI_API_KEY') }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'application/pdf', data: base64 } }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } }) });
    const result = await geminiResponse.json();
    if (!geminiResponse.ok) return Response.json({ error: result?.error?.message || 'Gemini could not analyse this PDF.' }, { status: 502 });
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return Response.json({ error: 'No readable information was found.' }, { status: 422 });
    return Response.json({ analysis: JSON.parse(text) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'PDF analysis failed.' }, { status: 500 });
  }
}