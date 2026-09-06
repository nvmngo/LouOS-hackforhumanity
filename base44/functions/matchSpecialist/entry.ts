import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const text = (value: unknown) => typeof value === 'string' ? value.slice(0, 2000).trim() : '';
const list = (value: unknown) => Array.isArray(value) ? value.filter(item => typeof item === 'string').slice(0, 12) : [];
const supportCategory: Record<string,string> = {'Somewhere to live':'Accommodation',Housing:'Accommodation','Domestic or family violence':'Domestic / family violence support','Domestic / Family Violence':'Domestic / family violence support',Safety:'Safety support',Money:'Financial assistance',Financial:'Financial assistance','Health, or how I’m feeling':'Health','Health or wellbeing':'Health','Health / Wellbeing':'Health','Family or children':'Family / child support','Family / Children':'Family / child support','Legal help':'Legal support',Legal:'Legal support','Work or study':'Employment',Employment:'Employment','Feeling alone':'Social support','Social support':'Social support','Social Support':'Social support','Something else':'Other',Other:'Other'};
const dependants = (data: any, source: string) => {
  const existing = text(source === 'paper' ? data.dependants : data.childrenDependants);
  if (existing) return existing;
  const answer = text(source === 'paper' ? data.has_children : data.hasChildren);
  const count = text(source === 'paper' ? data.children_count : data.childrenCount);
  if (answer.toLowerCase() === 'no') return 'No children';
  if (answer.toLowerCase() === 'yes') return count ? `${count} child${count === '1' ? '' : 'ren'}` : 'Has children';
  return '';
};
const primaryNeed = (data: any, source: string, categories: string[]) => text(source === 'paper' ? data.main_need : data.helpToday) || text(source === 'paper' ? data.reason_today : data.reasonToday) || (categories[0] ? supportCategory[categories[0]] || categories[0] : '') || text(source === 'paper' ? data.other_help : data.otherHelp) || 'General support';
const reportSection = (candidate: any, fallback: Record<string,unknown>, fields: string[]) => Object.fromEntries(fields.map(field => [field, Array.isArray(fallback[field]) ? list(candidate?.[field]).length ? list(candidate[field]) : fallback[field] : text(candidate?.[field]) || fallback[field]]));
const createCaseReport = (candidate: any, data: any, source: string, urgency: string, categories: string[]) => {
  const contact = text(source === 'paper' ? data.contact : data.phoneOrContact);
  const safeToday = text(data.safeToday).toLowerCase();
  const urgentText = text(source === 'paper' ? data.other_help : (data.otherHelp || data.urgentAttention));
  const urgent = /unsafe|danger|risk of harm|urgent|immediate|nowhere.*tonight/i.test(urgentText) ? urgentText : '';
  const secondaryNeeds = categories.map(category => supportCategory[category] || category);
  const safetyConcerns = [
    ...(secondaryNeeds.includes('Safety support') ? ['Safety support requested'] : []),
    ...(safeToday === 'no' ? ['Unsafe accommodation'] : []),
    ...(urgent ? [urgent] : [])
  ];
  const safetyLevel = safeToday === 'no' || urgency === 'immediate' ? 'Immediate concern' : safeToday === 'unsure' || urgency === 'high' ? 'Concern identified' : safeToday === 'yes' ? 'No immediate concern' : 'Not assessed / unknown';
  const fallback: any = {
    caseOverview:{caseId:'',openedDate:text(data.date),assignedSpecialist:'',status:'New',urgency,preferredLanguage:text(source === 'paper' ? data.preferred_language : data.preferredLanguage),preferredContactMethod:''},
    clientInformation:{fullName:text(source === 'paper' ? data.client_name : data.fullName),preferredName:text(source === 'paper' ? data.preferred_name : data.preferredName),age:text(data.age),pronouns:'',phone:contact,email:'',dependants:dependants(data,source),accommodation:text(source === 'paper' ? data.accommodation : data.currentAccommodation),preferredContactMethod:'',safeToContact:'',contactInstructions:''},
    presentingSituation:{summary:text(source === 'paper' ? (data.reason_today || data.summary) : data.reasonToday),recentChanges:text(source === 'paper' ? data.stay_duration : data.stayDuration)},
    safety:{level:safetyLevel,concerns:safetyConcerns,notes:urgent,sources:safetyConcerns.length?['Client reported']:[]},
    supportNeeds:{primaryNeed:primaryNeed(data,source,categories),secondaryNeeds,clientPriority:primaryNeed(data,source,categories)},
    background:{previousSupport:'',existingServices:'',supportNetwork:'',financialSituation:'',employmentSituation:'',healthInformation:'',legalMatters:'',previousIncidents:'',other:text(source === 'paper' ? (data.other_help || data.support_other || (data.key_information||[]).join(' ')) : (data.otherHelp || data.supportOther))},
    clientGoals:{immediateGoal:'',longerTermGoal:'',preferredSupport:'',concerns:'',preferences:'',declinedSupport:''},
    consultation:{clientReported:[],discussion:[],outcome:[]},supportPlan:{agreedPriority:'',agreedSolution:'',clientAgreement:'',serviceCommitment:'',agreedReferrals:[],backupPlan:''},actions:[],referrals:[],
    followUp:{nextContactDate:'',contactMethod:'',purpose:'',responsibleSpecialist:'',outstandingMatters:'',reviewRequired:''},closure:{outcomeAchieved:'',supportDelivered:'',remainingConcerns:'',continuingReferrals:'',closureReason:'',closureDate:'',clientInformed:''},
    provenance:[{field:'intake',source:source === 'paper' ? 'AI extraction from survey' : 'Client survey / intake',updatedAt:new Date().toISOString(),approvedBySpecialist:false,suggestionStatus:candidate?'Pending':'Approved'}]
  };
  if (!candidate || typeof candidate !== 'object') return fallback;
  return {
    caseOverview:reportSection(candidate.caseOverview,fallback.caseOverview,Object.keys(fallback.caseOverview)),clientInformation:reportSection(candidate.clientInformation,fallback.clientInformation,Object.keys(fallback.clientInformation)),presentingSituation:reportSection(candidate.presentingSituation,fallback.presentingSituation,Object.keys(fallback.presentingSituation)),safety:reportSection(candidate.safety,fallback.safety,Object.keys(fallback.safety)),supportNeeds:reportSection(candidate.supportNeeds,fallback.supportNeeds,Object.keys(fallback.supportNeeds)),background:reportSection(candidate.background,fallback.background,Object.keys(fallback.background)),clientGoals:reportSection(candidate.clientGoals,fallback.clientGoals,Object.keys(fallback.clientGoals)),consultation:fallback.consultation,supportPlan:fallback.supportPlan,actions:[],referrals:[],followUp:fallback.followUp,closure:fallback.closure,provenance:fallback.provenance
  };
};
const congestionLevel = (upcomingCases: number, maximumCaseload: number) => {
  if (maximumCaseload <= 0 || upcomingCases >= maximumCaseload) return 'at_capacity';
  const ratio = upcomingCases / maximumCaseload;
  if (ratio >= 0.8) return 'high';
  if (ratio >= 0.5) return 'moderate';
  return 'low';
};

const activeCaseload = (specialist: any) => Math.max(
  Number(specialist.current_caseload) || 0,
  Number(specialist.upcoming_case_count) || 0
);

const todayInSydney = () => new Intl.DateTimeFormat('en-AU', {
  weekday: 'long',
  timeZone: 'Australia/Sydney'
}).format(new Date()).toLowerCase();

const isAvailableToday = (availableDays: unknown, today: string) => {
  if (!Array.isArray(availableDays) || availableDays.length === 0) return true;
  return availableDays.some(day => typeof day === 'string' && (
    day.toLowerCase() === today || day.toLowerCase() === today.slice(0, 3)
  ));
};

const expertiseMatches = (skill: unknown, searchable: string) => {
  if (typeof skill !== 'string') return false;
  const normalizedSkill = skill.toLowerCase();
  if (searchable.includes(normalizedSkill)) return true;
  return normalizedSkill.split(/[^a-z]+/).filter(word => word.length > 3).some(word => searchable.includes(word));
};

const matchingContext = (caseReport: any, submissionData: any, categories: string[]) => {
  const background = caseReport?.background && typeof caseReport.background === 'object' ? Object.values(caseReport.background) : [];
  const goals = caseReport?.clientGoals && typeof caseReport.clientGoals === 'object' ? Object.values(caseReport.clientGoals) : [];
  return [
    submissionData.main_need,
    submissionData.summary,
    ...categories,
    caseReport?.presentingSituation?.summary,
    caseReport?.presentingSituation?.recentChanges,
    caseReport?.safety?.level,
    ...list(caseReport?.safety?.concerns),
    caseReport?.safety?.notes,
    caseReport?.supportNeeds?.primaryNeed,
    ...list(caseReport?.supportNeeds?.secondaryNeeds),
    caseReport?.supportNeeds?.clientPriority,
    ...background,
    ...goals
  ].map(text).filter(Boolean).join(' ').toLowerCase();
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const source = body?.source === 'paper' ? 'paper' : 'online';
    const data = body?.data && typeof body.data === 'object' ? body.data : {};
    const priorities = source === 'paper' && Array.isArray(data.problems) ? data.problems.map((item: any) => text(item?.priority)) : [];
    const safeToday = source === 'online' ? text(data.safeToday).toLowerCase() : '';
    const urgentAttention = text(source === 'paper' ? `${data.reason_today || ''} ${data.other_help || ''}` : `${data.reasonToday || ''} ${data.otherHelp || ''} ${data.urgentAttention || ''}`);
    const hasUrgentDetail = /unsafe|danger|risk of harm|urgent|immediate|nowhere.*tonight/i.test(urgentAttention);
    const immediateSignal = safeToday === 'no' || priorities.some(value => /immediate/i.test(value)) || (hasUrgentDetail && /unsafe|immediate|danger|risk of harm|nowhere.*tonight/i.test(urgentAttention));
    const onlineAreas = list(data.supportAreas).length ? list(data.supportAreas) : list(data.problemCategories);
    const highSignal = safeToday === 'unsure' || hasUrgentDetail || priorities.some(value => /high/i.test(value)) || list(source === 'paper' ? data.support_areas : onlineAreas).includes('Safety');
    const urgency = immediateSignal ? 'immediate' : highSignal ? 'high' : priorities.some(value => /medium/i.test(value)) ? 'medium' : 'low';
    const categories = source === 'paper' ? (list(data.support_areas).length ? list(data.support_areas) : (Array.isArray(data.problems) ? data.problems.map((item: any) => text(item?.category)).filter(Boolean) : [])) : onlineAreas;
    let caseReport = createCaseReport(body?.caseReport, data, source, urgency, categories);
    const submissionData = {
      source,
      client_name: text(source === 'paper' ? data.client_name : data.fullName),
      preferred_name: text(source === 'paper' ? data.preferred_name : data.preferredName),
      contact: text(source === 'paper' ? data.contact : data.phoneOrContact),
      preferred_language: text(source === 'paper' ? data.preferred_language : data.preferredLanguage),
      signature: text(source === 'online' ? data.signature : ''),
      signature_present: source === 'paper' ? data.signature_present === true : Boolean(text(data.signature)),
      ...(text(data.date) ? {form_date:text(data.date)} : {}),
      main_need: primaryNeed(data, source, categories),
      problem_categories: categories,
      urgency,
      summary: text(source === 'paper' ? (data.summary || [data.reason_today,data.other_help].filter(Boolean).join(' ')) : [data.reasonToday,data.otherHelp||data.recentEvents,data.urgentAttention].filter(Boolean).join(' ')),
      raw_answers: data,
      case_report: caseReport,
      report_history: caseReport.provenance,
      report_version: 1,
      status: 'matching'
    };
    const entities = base44.asServiceRole.entities;
    const submission = await entities.ClientSubmission.create(submissionData);
    const [specialists, assignedSubmissions, finalisedReports] = await Promise.all([
      entities.Specialist.filter({ active: true }),
      entities.ClientSubmission.filter({ status: 'matched' }, '-created_date', 5000),
      entities.EmployeeCaseReport.list('-created_date', 5000)
    ]);
    const completedSubmissionIds = new Set(finalisedReports.map((report: any) => report.submission_id));
    const upcomingBySpecialist = assignedSubmissions.reduce((counts: Map<string, number>, item: any) => {
      if (item.assigned_specialist_id && !completedSubmissionIds.has(item.id)) {
        counts.set(item.assigned_specialist_id, (counts.get(item.assigned_specialist_id) || 0) + 1);
      }
      return counts;
    }, new Map<string, number>());
    const specialistsWithCongestion = specialists.map((item: any) => {
      const upcomingCaseCount = upcomingBySpecialist.get(item.id) || 0;
      return {
        ...item,
        upcoming_case_count: upcomingCaseCount,
        congestion_level: congestionLevel(upcomingCaseCount, Number(item.maximum_caseload) || 0)
      };
    });
    await Promise.all(specialistsWithCongestion.map((item: any) => {
      const original = specialists.find((specialist: any) => specialist.id === item.id);
      if (original?.upcoming_case_count === item.upcoming_case_count && original?.congestion_level === item.congestion_level) return Promise.resolve();
      return entities.Specialist.update(item.id, {
        upcoming_case_count: item.upcoming_case_count,
        congestion_level: item.congestion_level
      });
    }));
    const searchable = matchingContext(caseReport, submissionData, categories);
    const today = todayInSydney();
    const urgencyWeight = urgency === 'immediate' ? 2 : urgency === 'high' ? 1.5 : 1;
    const ranked = specialistsWithCongestion.filter((item: any) => (
      item.availability_status !== 'unavailable' &&
      item.congestion_level !== 'at_capacity' &&
      activeCaseload(item) < Number(item.maximum_caseload)
    )).map((item: any) => {
      const expertiseScore = Math.min((item.expertise || []).reduce((score: number, skill: string) => score + (expertiseMatches(skill, searchable) ? 24 : 0), 0), 72);
      const languageScore = submissionData.preferred_language && (item.languages || []).some((language: string) => language.toLowerCase() === submissionData.preferred_language.toLowerCase()) ? 18 : 0;
      const availabilityScore = item.availability_status === 'available' ? 20 : 8;
      const scheduleScore = isAvailableToday(item.available_days, today) ? 10 : 0;
      const maximumCaseload = Number(item.maximum_caseload) || 1;
      const capacityScore = Math.round((1 - activeCaseload(item) / maximumCaseload) * 25);
      const experienceScore = Math.min(Number(item.years_experience) || 0, 15) * urgencyWeight;
      return { item, score: Math.round(expertiseScore + languageScore + availabilityScore + scheduleScore + capacityScore + experienceScore) };
    }).sort((a: any, b: any) => b.score - a.score);
    if (!ranked.length) {
      caseReport = {...caseReport,caseOverview:{...caseReport.caseOverview,caseId:`CASE-${submission.id.slice(-6).toUpperCase()}`,status:'Review needed'}};
      await entities.ClientSubmission.update(submission.id, { status: 'review_needed', case_report: caseReport });
      return Response.json({ submissionId: submission.id, status: 'review_needed' });
    }
    const match = ranked[0];
    const upcomingCaseCount = match.item.upcoming_case_count + 1;
    caseReport = {...caseReport,caseOverview:{...caseReport.caseOverview,caseId:`CASE-${submission.id.slice(-6).toUpperCase()}`,assignedSpecialist:match.item.full_name,status:'Active'}};
    await entities.ClientSubmission.update(submission.id, { status: 'matched', assigned_specialist_id: match.item.id, assigned_specialist_name: match.item.full_name, match_score: match.score, case_report: caseReport });
    await entities.Specialist.update(match.item.id, {
      upcoming_case_count: upcomingCaseCount,
      congestion_level: congestionLevel(upcomingCaseCount, Number(match.item.maximum_caseload) || 0)
    });
    return Response.json({ submissionId: submission.id, status: 'matched', specialistName: match.item.full_name });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Specialist matching failed.' }, { status: 500 });
  }
}
