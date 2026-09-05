import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { louosCaseAssistantContext, louosKnowledgeContext } from '../../shared/louosCaseAssistantContext.ts';

const responseSchema = {type:'object',properties:{assistantMessage:{type:'string'},enoughInformation:{type:'boolean'},safetyFlag:{type:'boolean'},draft:{type:'object',properties:{caseInformation:{type:'object',properties:{status:{type:'string'},urgency:{type:'string'}},required:['status','urgency']},client:{type:'object',properties:{name:{type:'string'},preferredName:{type:'string'},age:{type:'string'},preferredLanguage:{type:'string'},contact:{type:'string'},safeContactPreference:{type:'string'},dependants:{type:'string'},accommodation:{type:'string'}},required:['name','preferredName','age','preferredLanguage','contact','safeContactPreference','dependants','accommodation']},problems:{type:'array',items:{type:'object',properties:{category:{type:'string'},priority:{type:'string'},description:{type:'string'}},required:['category','priority','description']}},mainSupportNeed:{type:'string'},caseDescription:{type:'string'},keyInformation:{type:'array',items:{type:'string'}},interviewState:{type:'object',properties:{reason:{type:'string'}},required:['reason']}},required:['caseInformation','client','problems','mainSupportNeed','caseDescription','keyInformation','interviewState']},suggestions:{type:'array',items:{type:'object',properties:{action:{type:'string',enum:['Add','Update','Remove']},area:{type:'string',enum:['Housing','Domestic / Family Violence','Safety','Financial','Legal','Health / Wellbeing','Employment','Family / Children','Social Support','Other','Main Need','Key Information']},text:{type:'string'}},required:['action','area','text']}}},required:['assistantMessage','enoughInformation','safetyFlag','draft','suggestions']};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const operation = body?.operation;
    const input = typeof body?.input === 'string' ? body.input.trim() : '';
    const currentQuestion = typeof body?.currentQuestion === 'string' ? body.currentQuestion.slice(0, 500) : '';
    if (!['interview','quick_notes'].includes(operation)) return Response.json({ error: 'Invalid assistant operation.' }, { status: 400 });
    if (!input || input.length > 4000) return Response.json({ error: 'Please provide between 1 and 4,000 characters.' }, { status: 400 });
    const suppliedDraft = body?.draft && typeof body.draft === 'object' ? body.draft : {};
    const minimalDraft = {caseInformation:{status:suppliedDraft?.caseInformation?.status||'New',urgency:suppliedDraft?.caseInformation?.urgency||''},client:suppliedDraft?.client||{},problems:Array.isArray(suppliedDraft?.problems)?suppliedDraft.problems.slice(0,10):[],mainSupportNeed:suppliedDraft?.mainSupportNeed||'',caseDescription:suppliedDraft?.caseDescription||'',keyInformation:Array.isArray(suppliedDraft?.keyInformation)?suppliedDraft.keyInformation.slice(0,7):[],interviewState:{reason:suppliedDraft?.interviewState?.reason||''}};
    if (JSON.stringify(minimalDraft).length > 15000) return Response.json({ error: 'The draft is too large to analyse.' }, { status: 400 });
    const task = operation === 'quick_notes' ? `Analyse every relevant fact in the new quick notes and return separate suggested Add, Update, or Remove changes. Use an exact supported problem category for area, or Main Need, or Key Information. Include an information-only Legal suggestion when legal help is explicitly declined. Keep draft exactly unchanged. assistantMessage should briefly say the suggestions are ready.\nQuick notes: ${input}` : `Update the draft using the caseworker's latest answer. Preserve existing facts unless explicitly corrected. Return the full updated draft, then ask the single most useful missing question in assistantMessage. If enough information exists, set enoughInformation true and state that the report is ready instead of asking another question. Return no suggestions.\nCurrent question: ${currentQuestion}\nCaseworker answer: ${input}`;
    const prompt = `${louosCaseAssistantContext}\n\nKnowledge layer:\n${louosKnowledgeContext}\n\nCurrent draft JSON:\n${JSON.stringify(minimalDraft)}\n\nOperation:\n${task}`;
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';
    const requestOptions = {method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':secrets.get('GEMINI_API_KEY')},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',responseSchema,temperature:0.1,maxOutputTokens:2500}})};
    let geminiResponse = await fetch(endpoint, requestOptions);
    if ([429,503].includes(geminiResponse.status)) {
      await new Promise(resolve => setTimeout(resolve, 900));
      geminiResponse = await fetch(endpoint, requestOptions);
    }
    const result = await geminiResponse.json();
    if (!geminiResponse.ok) return Response.json({ error: result?.error?.message || 'Gemini could not analyse this case information.' }, { status: 502 });
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return Response.json({ error: 'Gemini returned no case information.' }, { status: 422 });
    return Response.json({ result: JSON.parse(text) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Case analysis failed.' }, { status: 500 });
  }
}