import OpenAI from 'npm:openai';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { optionalSecret } from '../../shared/optionalSecret.ts';
import { allowedFieldPaths, analysisRequestSchema, arrayFieldPaths, getReportValue, labelForField, modelOutputSchema, safetyLevels, sectionLabels } from '../../shared/caseNoteSuggestions.ts';
import { getPrototypeEmployee } from '../../shared/prototypeEmployeeAuth.ts';

const outputJsonSchema = {
  type:'object',
  additionalProperties:false,
  properties:{
    suggestedUpdates:{type:'array',maxItems:30,items:{type:'object',additionalProperties:false,properties:{
      fieldPath:{type:'string',enum:allowedFieldPaths},operation:{type:'string',enum:['add','update']},value:{type:'string',maxLength:2000},
      sourceType:{type:'string',enum:['client_reported','specialist_observed','specialist_note','unknown']},reason:{type:'string',maxLength:500},evidence:{type:'string',maxLength:500}
    },required:['fieldPath','operation','value','sourceType','reason','evidence']}},
    unmappedInformation:{type:'array',maxItems:20,items:{type:'object',additionalProperties:false,properties:{text:{type:'string',maxLength:1000},reason:{type:'string',maxLength:500}},required:['text','reason']}}
  },
  required:['suggestedUpdates','unmappedInformation']
};

const systemInstruction = `You are the LouOS Case Report Information Extraction Assistant.
Your sole task is to extract factual information from a specialist's consultation notes and propose structured updates to an existing case report.
Do not provide counselling, diagnosis, legal advice, medical advice, or autonomous case decisions. Use only information supported by the supplied specialist note. The current case report is context only.
Do not invent missing details or convert uncertainty into certainty. Do not infer consent, safety status, diagnoses, outcomes, referrals, agreements, or client preferences unless explicitly supported by the note.
Compare each fact with the current report. Omit unchanged duplicates. Treat contradictions or changed information as updates and preserve uncertainty. For list fields, add only unique information rather than replacing the list.
Safety information remains a proposed update requiring specialist approval; never label immediate danger unless the note clearly states an immediate concern. Discussion does not imply agreement or consent.
For safety.level, use exactly one of: No immediate concern, Concern identified, Immediate concern, Not assessed / unknown.
Write every value as a plain statement of fact in the report's own voice, as a reader of the case report would need it. Never attribute a fact to the note or to whoever wrote it: do not write "specialist note states", "the note says", "as recorded in the specialist note", "the specialist reports", or any similar wording. Record where a fact came from in sourceType, which is metadata, and never inside value.
Return only structured proposed changes. The official report is controlled by the specialist and is not changed until a specialist approves a suggestion.`;

const cleanText = (value: unknown, limit=2000) => typeof value === 'string' ? value.trim().slice(0,limit) : '';
const comparable = (value: unknown) => (Array.isArray(value) ? value.join(' ') : String(value || '')).trim().toLowerCase();

export default async function(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({error:'Method not allowed.'},{status:405,headers:{Allow:'POST'}});
  try {
    const base44 = createClientFromRequest(req);
    const requestBody = await req.json().catch(()=>null);
    const {employeeToken: _employeeToken, ...analysisBody} = requestBody && typeof requestBody === 'object' ? requestBody : {};
    const parsedRequest = analysisRequestSchema.safeParse(analysisBody);
    if (!parsedRequest.success) return Response.json({error:'A valid case, current report, and note of up to 6,000 characters are required.'},{status:400});
    const {caseId,note,currentReport} = parsedRequest.data;
    let user=null;
    try{user=await base44.auth.me();}catch{/* Handled below without exposing auth details. */}
    const prototypeEmployee = user ? null : await getPrototypeEmployee(requestBody, base44.asServiceRole.entities);
    if (!user && !prototypeEmployee) return Response.json({error:'Unauthorized.'},{status:401});
    if (prototypeEmployee) {
      const submission = await base44.asServiceRole.entities.ClientSubmission.get(caseId);
      if (!submission || submission.status !== 'matched' || submission.assigned_specialist_id !== prototypeEmployee.specialist.id) return Response.json({error:'You are not assigned to this case.'},{status:403});
    }

    const currentFields = Object.fromEntries(allowedFieldPaths.map(fieldPath=>{
      const value = getReportValue(currentReport,fieldPath);
      const sanitised = Array.isArray(value) ? value.slice(0,20).map(item=>cleanText(item,500)).filter(Boolean) : cleanText(value,2000);
      return [fieldPath,sanitised];
    }));
    if (JSON.stringify(currentFields).length > 20000) return Response.json({error:'The current Case Report is too large to analyse safely.'},{status:400});

    const apiKey = optionalSecret('OPENAI_API_KEY');
    if (!apiKey) return Response.json({error:"We couldn't analyse these notes right now. Your notes have not been lost. Please try again."},{status:503});
    const openai = new OpenAI({apiKey,maxRetries:1,timeout:30000});

    // Prototype data is fictional. Real client data requires organisational privacy and security review before production use.
    const response = await openai.responses.create({
      model:optionalSecret('OPENAI_MODEL') || 'gpt-5.6-luna',
      store:false,
      instructions:systemInstruction,
      input:JSON.stringify({caseId,currentCaseReport:currentFields,specialistNote:note}),
      max_output_tokens:4000,
      text:{format:{type:'json_schema',name:'louos_case_note_suggestions',strict:true,schema:outputJsonSchema}}
    });
    if (!response.output_text) return Response.json({error:"We couldn't safely structure these notes. No changes were made to the Case Report."},{status:422});
    let parsedJson:unknown;
    try{parsedJson=JSON.parse(response.output_text);}catch{return Response.json({error:"We couldn't safely structure these notes. No changes were made to the Case Report."},{status:422});}
    const parsed = modelOutputSchema.safeParse(parsedJson);
    if (!parsed.success) return Response.json({error:"We couldn't safely structure these notes. No changes were made to the Case Report."},{status:422});

    const seen = new Set<string>();
    const suggestedUpdates = parsed.data.suggestedUpdates.flatMap((suggestion,index)=>{
      if (suggestion.fieldPath==='safety.level'&&!safetyLevels.has(suggestion.value)) return [];
      const currentValue = currentFields[suggestion.fieldPath];
      if (comparable(currentValue) === comparable(suggestion.value)) return [];
      if (Array.isArray(currentValue) && currentValue.some(item=>comparable(item)===comparable(suggestion.value))) return [];
      const fingerprint = `${suggestion.fieldPath}:${comparable(suggestion.value)}`;
      if (seen.has(fingerprint)) return [];
      seen.add(fingerprint);
      const sectionKey = suggestion.fieldPath.split('.')[0];
      return [{
        id:`note-${crypto.randomUUID?.() || `${Date.now()}-${index}`}`,
        section:sectionLabels[sectionKey] || sectionKey,
        fieldPath:suggestion.fieldPath,
        label:labelForField(suggestion.fieldPath),
        operation:arrayFieldPaths.has(suggestion.fieldPath) || suggestion.fieldPath === 'actions' ? 'add' : comparable(currentValue) ? 'update' : 'add',
        value:suggestion.value,
        originalValue:suggestion.value,
        previousValue:Array.isArray(currentValue) ? '' : cleanText(currentValue),
        sourceType:suggestion.sourceType,
        reason:suggestion.reason,
        evidence:suggestion.evidence,
        status:'pending'
      }];
    });
    return Response.json({suggestedUpdates,unmappedInformation:parsed.data.unmappedInformation});
  } catch {
    // Never log consultation notes or raw provider responses.
    return Response.json({error:"We couldn't analyse these notes right now. Your notes have not been lost. Please try again."},{status:502});
  }
}
