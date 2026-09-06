import { secrets } from 'base44:runtime';

const allowedFileHosts = [
  'base44.com',
  'base44.app',
  'base44cdn.com',
  'wixstatic.com',
  'wixmp.com',
  'supabase.co',
  'storage.googleapis.com',
  'googleusercontent.com',
];

const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

function isTrustedFileUrl(fileUrl: string, req: Request): boolean {
  let fileLocation: URL;

  try {
    fileLocation = new URL(fileUrl);
  } catch {
    return false;
  }

  const isAllowedHostedFile =
    fileLocation.protocol === 'https:' &&
    allowedFileHosts.some(
      (host) => fileLocation.hostname === host || fileLocation.hostname.endsWith(`.${host}`),
    );

  if (isAllowedHostedFile) return true;

  // `base44 dev` stores uploads on its own HTTP loopback origin. Trust that
  // origin only when the function proxy confirms it is also running locally.
  const apiUrl = req.headers.get('Base44-Api-Url');
  if (!apiUrl) return false;

  try {
    const localApi = new URL(apiUrl);
    return (
      localApi.protocol === 'http:' &&
      loopbackHosts.has(localApi.hostname) &&
      fileLocation.origin === localApi.origin
    );
  } catch {
    return false;
  }
}

export default async function(req: Request): Promise<Response> {
  try {
    const { fileUrl } = await req.json();
    if (!fileUrl || typeof fileUrl !== 'string') return Response.json({ error: 'A form image is required.' }, { status: 400 });
    if (!isTrustedFileUrl(fileUrl, req)) return Response.json({ error: 'Invalid file location.' }, { status: 400 });
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) return Response.json({ error: 'The uploaded image could not be read.' }, { status: 400 });
    const mimeType = (fileResponse.headers.get('content-type') || '').split(';')[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(mimeType)) return Response.json({ error: 'Please upload a JPG, PNG, WEBP, HEIC, or HEIF image.' }, { status: 400 });
    const bytes = new Uint8Array(await fileResponse.arrayBuffer());
    if (bytes.length > 10 * 1024 * 1024) return Response.json({ error: 'The image must be smaller than 10 MB.' }, { status: 400 });
    const base64 = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
    const prompt = `Read this image of a completed handwritten "Lou's Place — Welcome Form" carefully. It is a one-page form with four numbered sections and a signature/date block. Use only the printed labels listed below to associate handwriting, ticks, and marks with the correct field.

Extract the form exactly as printed:
1. ABOUT YOU: Your name; What should we call you?; Age; Language you prefer; Phone (optional); Do you have any children? (No / Yes, and how many); Where are you staying now?; How long can you stay there? (roughly).
2. WHAT'S GOING ON RIGHT NOW — tick anything that applies: Somewhere to live; Safety; Money; Health, or how I'm feeling; Family or children; Legal help; Work or study; Feeling alone; Something else, including its written detail.
3. YOUR SITUATION: Why did you come to Lou's Place today?
4. ANYTHING ELSE: Is there anything else we can help you with?
SIGNATURE: Whether a mark or signature is present, and Today's date. Do not try to identify or transcribe an illegible handwritten signature.

Return JSON with exactly these keys: client_name, preferred_name, age, preferred_language, contact, has_children, children_count, accommodation, stay_duration, support_areas, support_other, reason_today, other_help, signature_present, date, main_need, problems, key_information, summary.

has_children must be "Yes", "No", or an empty string. signature_present must be true only when a signature or mark is visibly present. support_areas must contain only visibly ticked labels, copied exactly from the list above. problems must contain one object for each selected support area with category copied exactly, priority as an empty string, and description empty except that Something else may use the written support_other detail. main_need should copy an explicit request from reason_today or other_help; if neither contains an explicit request, use the first selected support area or an empty string. key_information may contain short factual strings for children and accommodation duration when present.

summary must be a concise factual summary of only the completed responses. Extract only information actually handwritten or visibly marked. Never guess, infer, complete blank fields, treat printed form text as a response, or invent a safety assessment or urgency. If handwriting or a mark is unclear, use an empty string, false, or omit that item from an array.`;
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
