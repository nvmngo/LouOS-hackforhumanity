import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { optionalSecret } from '../../shared/optionalSecret.ts';
import { louosCaseAssistantContext, louosKnowledgeContext } from '../../shared/louosCaseAssistantContext.ts';

const responseSchema = {type:'object',properties:{assistantMessage:{type:'string'},enoughInformation:{type:'boolean'},safetyFlag:{type:'boolean'},draft:{type:'object',properties:{caseInformation:{type:'object',properties:{status:{type:'string'},urgency:{type:'string'}},required:['status','urgency']},client:{type:'object',properties:{name:{type:'string'},preferredName:{type:'string'},age:{type:'string'},preferredLanguage:{type:'string'},contact:{type:'string'},safeContactPreference:{type:'string'},dependants:{type:'string'},accommodation:{type:'string'}},required:['name','preferredName','age','preferredLanguage','contact','safeContactPreference','dependants','accommodation']},problems:{type:'array',items:{type:'object',properties:{category:{type:'string'},priority:{type:'string'},description:{type:'string'}},required:['category','priority','description']}},mainSupportNeed:{type:'string'},caseDescription:{type:'string'},keyInformation:{type:'array',items:{type:'string'}},interviewState:{type:'object',properties:{reason:{type:'string'}},required:['reason']}},required:['caseInformation','client','problems','mainSupportNeed','caseDescription','keyInformation','interviewState']},suggestions:{type:'array',items:{type:'object',properties:{action:{type:'string',enum:['Add','Update','Remove']},area:{type:'string',enum:['Housing','Domestic / Family Violence','Safety','Financial','Legal','Health / Wellbeing','Employment','Family / Children','Social Support','Other','Main Need','Key Information']},text:{type:'string'}},required:['action','area','text']}}},required:['assistantMessage','enoughInformation','safetyFlag','draft','suggestions']};

const stringField={type:'string'};
const stringList={type:'array',items:stringField};
const object=(properties: Record<string, unknown>)=>({type:'object',properties,required:Object.keys(properties)});
const structuredDraftSchema=object({
  caseOverview:object({caseId:stringField,openedDate:stringField,assignedSpecialist:stringField,status:stringField,urgency:stringField,preferredLanguage:stringField,preferredContactMethod:stringField}),
  clientInformation:object({fullName:stringField,preferredName:stringField,age:stringField,pronouns:stringField,phone:stringField,email:stringField,dependants:stringField,accommodation:stringField,preferredContactMethod:stringField,safeToContact:stringField,contactInstructions:stringField}),
  presentingSituation:object({summary:stringField,recentChanges:stringField}),
  safety:object({level:{type:'string',enum:['No immediate concern','Concern identified','Immediate concern','Not assessed / unknown']},concerns:stringList,notes:stringField,sources:stringList}),
  supportNeeds:object({primaryNeed:stringField,secondaryNeeds:stringList,clientPriority:stringField}),
  background:object({previousSupport:stringField,existingServices:stringField,supportNetwork:stringField,financialSituation:stringField,employmentSituation:stringField,healthInformation:stringField,legalMatters:stringField,previousIncidents:stringField,other:stringField}),
  clientGoals:object({immediateGoal:stringField,longerTermGoal:stringField,preferredSupport:stringField,concerns:stringField,preferences:stringField,declinedSupport:stringField}),
  consultation:object({clientReported:stringList,discussion:stringList,outcome:stringList}),
  supportPlan:object({agreedPriority:stringField,agreedSolution:stringField,clientAgreement:stringField,serviceCommitment:stringField,agreedReferrals:stringList,backupPlan:stringField}),
  actions:{type:'array',items:object({description:stringField,responsiblePerson:stringField,dueDate:stringField,status:stringField,outcome:stringField})},
  referrals:{type:'array',items:object({organisation:stringField,reason:stringField,consent:stringField,referralDate:stringField,status:stringField,outcome:stringField})},
  followUp:object({nextContactDate:stringField,contactMethod:stringField,purpose:stringField,responsibleSpecialist:stringField,outstandingMatters:stringField,reviewRequired:stringField}),
  closure:object({outcomeAchieved:stringField,supportDelivered:stringField,remainingConcerns:stringField,continuingReferrals:stringField,closureReason:stringField,closureDate:stringField,clientInformed:stringField}),
  provenance:{type:'array',items:object({field:stringField,source:stringField,updatedAt:stringField,approvedBySpecialist:{type:'boolean'},suggestionStatus:stringField})}
});
const intakeResponseSchema=object({assistantMessage:stringField,enoughInformation:{type:'boolean'},safetyFlag:{type:'boolean'},draft:structuredDraftSchema,suggestions:{type:'array',items:object({action:stringField,section:stringField,fieldPath:stringField,label:stringField,value:stringField})}});
const consultationResponseSchema=object({assistantMessage:stringField,enoughInformation:{type:'boolean'},safetyFlag:{type:'boolean'},suggestions:{type:'array',items:object({action:{type:'string',enum:['Add','Update']},section:{type:'string',enum:['Presenting Situation','Safety & Immediate Concerns','Support Needs','Relevant Background','Client Goals & Preferences','Consultation Summary','Support Plan / Agreed Solution','Actions & Follow-Up']},fieldPath:{type:'string',enum:['presentingSituation.summary','presentingSituation.recentChanges','safety.level','safety.concerns','safety.notes','supportNeeds.primaryNeed','supportNeeds.secondaryNeeds','supportNeeds.clientPriority','background.previousSupport','background.existingServices','background.supportNetwork','background.financialSituation','background.employmentSituation','background.healthInformation','background.legalMatters','background.previousIncidents','background.other','clientGoals.immediateGoal','clientGoals.longerTermGoal','clientGoals.preferredSupport','clientGoals.concerns','clientGoals.preferences','clientGoals.declinedSupport','consultation.clientReported','consultation.discussion','consultation.outcome','supportPlan.agreedPriority','supportPlan.agreedSolution','supportPlan.clientAgreement','supportPlan.serviceCommitment','supportPlan.agreedReferrals','supportPlan.backupPlan','actions','followUp.nextContactDate','followUp.contactMethod','followUp.purpose','followUp.responsibleSpecialist','followUp.outstandingMatters','followUp.reviewRequired']},label:stringField,value:stringField})}});

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const operation = body?.operation;
    if (operation !== 'online_report') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const input = typeof body?.input === 'string' ? body.input.trim() : '';
    const currentQuestion = typeof body?.currentQuestion === 'string' ? body.currentQuestion.slice(0, 500) : '';
    if (!['interview','quick_notes','online_report','consultation_notes'].includes(operation)) return Response.json({ error: 'Invalid assistant operation.' }, { status: 400 });
    const inputLimit = operation === 'online_report' ? 10000 : operation === 'consultation_notes' ? 6000 : 4000;
    if (!input || input.length > inputLimit) return Response.json({ error: `Please provide between 1 and ${inputLimit.toLocaleString()} characters.` }, { status: 400 });
    const suppliedDraft = body?.draft && typeof body.draft === 'object' ? body.draft : {};
    const minimalDraft = ['online_report','consultation_notes'].includes(operation) ? suppliedDraft : {caseInformation:{status:suppliedDraft?.caseInformation?.status||'New',urgency:suppliedDraft?.caseInformation?.urgency||''},client:suppliedDraft?.client||{},problems:Array.isArray(suppliedDraft?.problems)?suppliedDraft.problems.slice(0,10):[],mainSupportNeed:suppliedDraft?.mainSupportNeed||'',caseDescription:suppliedDraft?.caseDescription||'',keyInformation:Array.isArray(suppliedDraft?.keyInformation)?suppliedDraft.keyInformation.slice(0,7):[],interviewState:{reason:suppliedDraft?.interviewState?.reason||''}};
    if (JSON.stringify(minimalDraft).length > 15000) return Response.json({ error: 'The draft is too large to analyse.' }, { status: 400 });
    const task = operation === 'consultation_notes' ? `Extract every useful fact from the specialist's consultation notes and map each fact to one supported fieldPath in the same living case report. Return separate suggestions. Use Add for list fields and Update for scalar fields. Distinguish client-reported facts, discussion, decisions, consent, and specialist assessment. Never infer consent, safety, a diagnosis, a referral, or an agreement. Do not modify the supplied report. assistantMessage should briefly say the structured suggestions are ready.\nConsultation notes: ${input}` : operation === 'quick_notes' ? `Analyse every relevant fact in the new quick notes and return separate suggested Add, Update, or Remove changes. Use an exact supported problem category for area, or Main Need, or Key Information. Include an information-only Legal suggestion when legal help is explicitly declined. Keep draft exactly unchanged. assistantMessage should briefly say the suggestions are ready.\nQuick notes: ${input}` : operation === 'online_report' ? `Transform this completed Lou's Place Welcome Form into the complete structured Case Support Report shape. Populate only Case Overview, Client Information, Presenting Situation, Safety, Support Needs, Relevant Background, and Client Goals & Preferences where directly supported. Leave Consultation, Support Plan, Actions, Referrals, Follow-Up, and Closure empty because they require specialist discussion. Map hasChildren and childrenCount to dependants, currentAccommodation to accommodation, stayDuration to recentChanges, reasonToday to the presenting situation, and otherHelp to relevant background. Map supportAreas exactly as follows: Somewhere to live to Accommodation; Safety to Safety support; Money to Financial assistance; Health, or how I’m feeling to Health; Family or children to Family / child support; Legal help to Legal support; Work or study to Employment; Feeling alone to Social support; and Something else to Other, using supportOther as its detail. Use reasonToday as the primary need only when it clearly states what support is wanted; otherwise use the first selected support area or General support. A Safety tick means safety support was requested, not that a professional safety assessment was completed. Do not infer consent, contact preferences, urgency, goals, or safety level from the signature or blank fields. For missing scalar fields use an empty string, not invented content. Set status New, enoughInformation true, return no suggestions, and add intake provenance with source AI extraction from survey and suggestionStatus Pending.\nOnline form JSON: ${input}` : `Update the draft using the caseworker's latest answer. Preserve existing facts unless explicitly corrected. Return the full updated draft, then ask the single most useful missing question in assistantMessage. If enough information exists, set enoughInformation true and state that the report is ready instead of asking another question. Return no suggestions.\nCurrent question: ${currentQuestion}\nCaseworker answer: ${input}`;
    const prompt = `${louosCaseAssistantContext}\n\nKnowledge layer:\n${louosKnowledgeContext}\n\nCurrent draft JSON:\n${JSON.stringify(minimalDraft)}\n\nOperation:\n${task}`;
    const apiKey = optionalSecret('OPENAI_API_KEY');
    if (!apiKey) return Response.json({ error: 'OPENAI_API_KEY is not set for this app. Add it with: base44 secrets set OPENAI_API_KEY=your-key' }, { status: 503 });
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const selectedSchema = operation === 'consultation_notes' ? consultationResponseSchema : operation === 'online_report' ? intakeResponseSchema : responseSchema;
    // JSON mode does not enforce a schema, so the expected shape travels in the prompt.
    const schemaPrompt = `${prompt}\n\nReturn only JSON matching this exact shape:\n${JSON.stringify(selectedSchema)}`;
    const requestOptions = {method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:optionalSecret('OPENAI_MODEL')||'gpt-4o-mini',messages:[{role:'user',content:schemaPrompt}],response_format:{type:'json_object'},temperature:0.1,max_tokens:5000})};
    let aiResponse = await fetch(endpoint, requestOptions);
    if ([429,503].includes(aiResponse.status)) {
      await new Promise(resolve => setTimeout(resolve, 900));
      aiResponse = await fetch(endpoint, requestOptions);
    }
    const result = await aiResponse.json();
    if (!aiResponse.ok) return Response.json({ error: result?.error?.message || 'OpenAI could not analyse this case information.' }, { status: 502 });
    const text = result?.choices?.[0]?.message?.content;
    if (!text) return Response.json({ error: 'OpenAI returned no case information.' }, { status: 422 });
    return Response.json({ result: JSON.parse(text) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Case analysis failed.' }, { status: 500 });
  }
}
