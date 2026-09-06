import { z } from 'npm:zod@3.24.2';

export const allowedFieldPaths = [
  'caseOverview.urgency','caseOverview.preferredLanguage','caseOverview.preferredContactMethod',
  'clientInformation.fullName','clientInformation.preferredName','clientInformation.age','clientInformation.pronouns','clientInformation.phone','clientInformation.email','clientInformation.dependants','clientInformation.accommodation','clientInformation.preferredContactMethod','clientInformation.safeToContact','clientInformation.contactInstructions',
  'presentingSituation.summary','presentingSituation.recentChanges',
  'safety.level','safety.concerns','safety.notes',
  'supportNeeds.primaryNeed','supportNeeds.secondaryNeeds','supportNeeds.clientPriority',
  'background.previousSupport','background.existingServices','background.supportNetwork','background.financialSituation','background.employmentSituation','background.healthInformation','background.legalMatters','background.previousIncidents','background.other',
  'clientGoals.immediateGoal','clientGoals.longerTermGoal','clientGoals.preferredSupport','clientGoals.concerns','clientGoals.preferences','clientGoals.declinedSupport',
  'consultation.clientReported','consultation.discussion','consultation.outcome',
  'supportPlan.agreedPriority','supportPlan.agreedSolution','supportPlan.clientAgreement','supportPlan.serviceCommitment','supportPlan.agreedReferrals','supportPlan.backupPlan',
  'actions',
  'followUp.nextContactDate','followUp.contactMethod','followUp.purpose','followUp.responsibleSpecialist','followUp.outstandingMatters','followUp.reviewRequired'
] as const;

export const arrayFieldPaths = new Set<string>([
  'safety.concerns','supportNeeds.secondaryNeeds','consultation.clientReported',
  'consultation.discussion','consultation.outcome','supportPlan.agreedReferrals'
]);
export const safetyLevels = new Set(['No immediate concern','Concern identified','Immediate concern','Not assessed / unknown']);

export const sectionLabels: Record<string,string> = {
  caseOverview:'Case Overview',clientInformation:'Client Information',presentingSituation:'Presenting Situation',
  safety:'Safety & Immediate Concerns',supportNeeds:'Identified Support Needs',background:'Relevant Background',
  clientGoals:'Client Goals & Preferences',consultation:'Consultation Summary',supportPlan:'Support Plan / Agreed Solution',
  actions:'Actions & Responsibilities',followUp:'Follow-Up Plan'
};

export const fieldLabels: Record<string,string> = {
  'clientInformation.accommodation':'Current accommodation','clientInformation.dependants':'Dependants',
  'presentingSituation.summary':'Current situation','presentingSituation.recentChanges':'Important recent events',
  'safety.level':'Safety level','safety.concerns':'Safety concern','safety.notes':'Safety notes',
  'supportNeeds.primaryNeed':'Primary need','supportNeeds.secondaryNeeds':'Secondary support need',
  'supportNeeds.clientPriority':'Client-stated priority','clientGoals.declinedSupport':'Declined action or service',
  'clientGoals.immediateGoal':'Immediate goal','background.financialSituation':'Financial situation',
  'background.legalMatters':'Relevant legal matters','consultation.clientReported':'Client-reported information',
  'consultation.discussion':'Option or service discussed','consultation.outcome':'Key decision or unresolved matter',
  actions:'Next action'
};

export const suggestionSourceSchema = z.enum(['client_reported','specialist_observed','specialist_note','unknown']);
export const suggestionOperationSchema = z.enum(['add','update']);
export const suggestionStatusSchema = z.enum(['pending','approved','edited_and_approved','rejected']);

export const analysisRequestSchema = z.object({
  caseId:z.string().trim().min(1).max(100),
  note:z.string().trim().min(1).max(6000),
  currentReport:z.record(z.unknown())
}).strict();

export const modelSuggestionSchema = z.object({
  fieldPath:z.enum(allowedFieldPaths),
  operation:suggestionOperationSchema,
  value:z.string().trim().min(1).max(2000),
  sourceType:suggestionSourceSchema,
  reason:z.string().trim().min(1).max(500),
  evidence:z.string().trim().min(1).max(500)
}).strict();

export const modelOutputSchema = z.object({
  suggestedUpdates:z.array(modelSuggestionSchema).max(30),
  unmappedInformation:z.array(z.object({text:z.string().trim().min(1).max(1000),reason:z.string().trim().min(1).max(500)}).strict()).max(20)
}).strict();

export const reviewRequestSchema = z.object({
  caseId:z.string().trim().min(1).max(100),
  decision:z.enum(['approved','rejected']),
  suggestion:z.object({
    id:z.string().trim().min(1).max(100),
    fieldPath:z.enum(allowedFieldPaths),
    section:z.string().trim().min(1).max(100),
    label:z.string().trim().min(1).max(100),
    operation:suggestionOperationSchema,
    originalValue:z.string().trim().min(1).max(2000),
    finalValue:z.string().trim().min(1).max(2000),
    sourceType:suggestionSourceSchema,
    reason:z.string().trim().min(1).max(500),
    evidence:z.string().trim().min(1).max(500)
  }).strict()
}).strict();

export const getReportValue = (report: unknown, fieldPath: string): unknown => {
  if (!allowedFieldPaths.includes(fieldPath as typeof allowedFieldPaths[number]) || !report || typeof report !== 'object') return '';
  if (fieldPath === 'actions') {
    const actions = (report as Record<string,unknown>).actions;
    return Array.isArray(actions) ? actions.map(item=>item && typeof item === 'object' ? String((item as Record<string,unknown>).description || '') : '').filter(Boolean) : [];
  }
  const [section,field] = fieldPath.split('.');
  const sectionValue = (report as Record<string,unknown>)[section];
  return sectionValue && typeof sectionValue === 'object' ? (sectionValue as Record<string,unknown>)[field] : '';
};

export const labelForField = (fieldPath: string) => fieldLabels[fieldPath] || (fieldPath.split('.')[1]||fieldPath).replace(/([A-Z])/g,' $1').replace(/^./,letter=>letter.toUpperCase());
