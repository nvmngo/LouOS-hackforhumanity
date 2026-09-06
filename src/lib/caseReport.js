const text=value=>typeof value==='string'?value.trim():value==null?'':String(value);
const list=value=>Array.isArray(value)?value.map(text).filter(Boolean):text(value)?[text(value)]:[];

const supportCategory={
  'Somewhere to live':'Accommodation',Housing:'Accommodation','Domestic or family violence':'Domestic / family violence support','Domestic / Family Violence':'Domestic / family violence support',
  Safety:'Safety support',Money:'Financial assistance',Financial:'Financial assistance',
  'Health, or how I’m feeling':'Health','Health or wellbeing':'Health','Health / Wellbeing':'Health',
  'Family or children':'Family / child support','Family / Children':'Family / child support','Legal help':'Legal support',Legal:'Legal support',
  'Work or study':'Employment',Employment:'Employment','Feeling alone':'Social support',
  'Social support':'Social support','Social Support':'Social support','Something else':'Other',Other:'Other'
};

export const emptyCaseReport=()=>({
  caseOverview:{caseId:'',openedDate:'',assignedSpecialist:'',status:'New',urgency:'',preferredLanguage:'',preferredContactMethod:''},
  clientInformation:{fullName:'',preferredName:'',age:'',pronouns:'',phone:'',email:'',dependants:'',accommodation:'',preferredContactMethod:'',safeToContact:'',contactInstructions:''},
  presentingSituation:{summary:'',recentChanges:''},
  safety:{level:'Not assessed / unknown',concerns:[],notes:'',sources:[]},
  supportNeeds:{primaryNeed:'',secondaryNeeds:[],clientPriority:''},
  background:{previousSupport:'',existingServices:'',supportNetwork:'',financialSituation:'',employmentSituation:'',healthInformation:'',legalMatters:'',previousIncidents:'',other:''},
  clientGoals:{immediateGoal:'',longerTermGoal:'',preferredSupport:'',concerns:'',preferences:'',declinedSupport:''},
  consultation:{clientReported:[],discussion:[],outcome:[]},
  supportPlan:{agreedPriority:'',agreedSolution:'',clientAgreement:'',serviceCommitment:'',agreedReferrals:[],backupPlan:''},
  actions:[],
  referrals:[],
  followUp:{nextContactDate:'',contactMethod:'',purpose:'',responsibleSpecialist:'',outstandingMatters:'',reviewRequired:''},
  closure:{outcomeAchieved:'',supportDelivered:'',remainingConcerns:'',continuingReferrals:'',closureReason:'',closureDate:'',clientInformed:''},
  provenance:[]
});

const mergeReport=(base,incoming)=>{
  const merged={...base,...incoming};
  for(const key of ['caseOverview','clientInformation','presentingSituation','safety','supportNeeds','background','clientGoals','consultation','supportPlan','followUp','closure']){
    merged[key]={...base[key],...(incoming?.[key]||{})};
  }
  merged.safety.concerns=list(merged.safety.concerns);
  merged.safety.sources=list(merged.safety.sources);
  merged.supportNeeds.secondaryNeeds=list(merged.supportNeeds.secondaryNeeds);
  merged.consultation.clientReported=list(merged.consultation.clientReported);
  merged.consultation.discussion=list(merged.consultation.discussion);
  merged.consultation.outcome=list(merged.consultation.outcome);
  merged.supportPlan.agreedReferrals=list(merged.supportPlan.agreedReferrals);
  merged.actions=Array.isArray(incoming?.actions)?incoming.actions:base.actions;
  merged.referrals=Array.isArray(incoming?.referrals)?incoming.referrals:base.referrals;
  merged.provenance=Array.isArray(incoming?.provenance)?incoming.provenance:base.provenance;
  return merged;
};

const safetyLevel=(urgency,safeToday)=>{
  if(text(safeToday).toLowerCase()==='no'||text(urgency).toLowerCase()==='immediate')return 'Immediate concern';
  if(text(safeToday).toLowerCase()==='unsure'||text(urgency).toLowerCase()==='high')return 'Concern identified';
  if(text(safeToday).toLowerCase()==='yes')return 'No immediate concern';
  return 'Not assessed / unknown';
};

export function normalizeCaseReport(record={}){
  const raw=record.raw_answers||{};
  const caseId=record.caseId||record.case_id||record.form_id||(record.id?`CASE-${record.id.slice(-6).toUpperCase()}`:'');
  const contact=text(record.contact||raw.phoneOrContact);
  const categories=list(record.problem_categories||raw.supportAreas||raw.support_areas||raw.problemCategories).map(item=>supportCategory[item]||item);
  const urgent=text(raw.urgentAttention);
  const childAnswer=text(raw.hasChildren||raw.has_children);
  const childCount=text(raw.childrenCount||raw.children_count);
  const dependants=text(raw.childrenDependants||raw.dependants||record.dependants)||(childAnswer.toLowerCase()==='no'?'No children':childAnswer.toLowerCase()==='yes'?(childCount?`${childCount} child${childCount==='1'?'':'ren'}`:'Has children'):'');
  const concerns=[
    ...list(record.safety_concerns),
    ...(categories.includes('Safety support')?['Safety support requested']:[]),
    ...(text(raw.safeToday).toLowerCase()==='no'?['Unsafe accommodation']:[]),
    ...(urgent?[urgent]:[])
  ].filter((value,index,array)=>array.indexOf(value)===index);
  const source=record.source==='paper'?'AI extraction from survey':'Client survey / intake';
  const created=record.created_date||record.createdDate||new Date().toISOString();
  const legacy={
    caseOverview:{caseId,openedDate:text(raw.date||created).slice(0,10),assignedSpecialist:text(record.assigned_specialist_name),status:text(record.status)==='matched'?'Active':text(record.status||'New'),urgency:text(record.urgency),preferredLanguage:text(record.preferred_language||raw.preferredLanguage),preferredContactMethod:text(raw.safeContactPreference)},
    clientInformation:{fullName:text(record.client_name||raw.fullName),preferredName:text(record.preferred_name||raw.preferredName),age:text(raw.age),pronouns:text(raw.pronouns),phone:contact.includes('@')?'':contact,email:contact.includes('@')?contact:text(raw.email),dependants,accommodation:text(raw.currentAccommodation||raw.accommodation||record.accommodation),preferredContactMethod:text(raw.safeContactPreference),safeToContact:text(raw.safeToday),contactInstructions:text(raw.safeContactPreference||record.safeContact)},
    presentingSituation:{summary:text(record.summary||raw.reasonToday||raw.reason_today),recentChanges:text(raw.recentEvents||raw.stayDuration||raw.stay_duration)},
    safety:{level:safetyLevel(record.urgency,raw.safeToday),concerns,notes:urgent,sources:concerns.length?['Client reported']:[]},
    supportNeeds:{primaryNeed:text(record.main_need||raw.helpToday||record.mainNeed),secondaryNeeds:categories,clientPriority:text(raw.helpToday||record.main_need||record.mainNeed)},
    background:{other:text(raw.otherHelp||raw.other_help||raw.supportOther||raw.support_other||raw.otherFacts)},
    clientGoals:{immediateGoal:text(raw.helpToday||record.main_need||record.mainNeed)},
    provenance:[{field:'intake',source,updatedAt:created,approvedBySpecialist:false,suggestionStatus:record.source==='paper'?'Pending':'Approved'}]
  };
  const report=mergeReport(mergeReport(emptyCaseReport(),legacy),record.case_report||record.caseReport||{});
  report.provenance=[...report.provenance,...(Array.isArray(record.report_history)?record.report_history:[])];
  return report;
}

const scalarPaths=[
  'caseOverview.urgency','caseOverview.preferredLanguage','caseOverview.preferredContactMethod',
  'clientInformation.fullName','clientInformation.preferredName','clientInformation.age','clientInformation.pronouns','clientInformation.phone','clientInformation.email','clientInformation.dependants','clientInformation.accommodation','clientInformation.preferredContactMethod','clientInformation.safeToContact','clientInformation.contactInstructions',
  'presentingSituation.summary','presentingSituation.recentChanges','safety.level','safety.notes',
  'supportNeeds.primaryNeed','supportNeeds.clientPriority','background.previousSupport','background.existingServices','background.supportNetwork','background.financialSituation','background.employmentSituation','background.healthInformation','background.legalMatters','background.previousIncidents','background.other',
  'clientGoals.immediateGoal','clientGoals.longerTermGoal','clientGoals.preferredSupport','clientGoals.concerns','clientGoals.preferences','clientGoals.declinedSupport',
  'supportPlan.agreedPriority','supportPlan.agreedSolution','supportPlan.clientAgreement','supportPlan.serviceCommitment','supportPlan.backupPlan',
  'followUp.nextContactDate','followUp.contactMethod','followUp.purpose','followUp.responsibleSpecialist','followUp.outstandingMatters','followUp.reviewRequired'
];
const arrayPaths=new Set(['safety.concerns','supportNeeds.secondaryNeeds','consultation.clientReported','consultation.discussion','consultation.outcome','supportPlan.agreedReferrals']);
const allowedPaths=new Set([...scalarPaths,...arrayPaths,'actions']);
const safetyLevels=new Set(['No immediate concern','Concern identified','Immediate concern','Not assessed / unknown']);

export function applyReportSuggestion(report,suggestion){
  const next=mergeReport(emptyCaseReport(),report||{});
  const path=text(suggestion?.fieldPath||suggestion?.field_path);
  const value=text(suggestion?.finalValue??suggestion?.final_value??suggestion?.value??suggestion?.text);
  const status=suggestion?.status;
  if(!allowedPaths.has(path)||!value||status==='pending'||status==='rejected')return next;
  if(path==='safety.level'&&!safetyLevels.has(value))return next;
  if(path==='actions'){
    next.actions=[...next.actions,{description:value,responsiblePerson:'To be confirmed',dueDate:'',status:'To do',outcome:''}];
    return next;
  }
  const[section,field]=path.split('.');
  if(arrayPaths.has(path))next[section][field]=[...list(next[section][field]),value].filter((item,index,array)=>array.indexOf(item)===index);
  else next[section][field]=value;
  return next;
}

export function applyReportSuggestions(report,suggestions=[]){
  return suggestions.reduce((next,suggestion)=>applyReportSuggestion(next,suggestion),mergeReport(emptyCaseReport(),report||{}));
}

export function suggestionHistory(suggestions=[],specialist=''){
  return suggestions.map(item=>({field_path:text(item.fieldPath||item.field_path),new_value:text(item.finalValue??item.final_value??item.value??item.text),source:'Consultation AI extraction',updated_at:item.approvedAt||item.reviewed_at||new Date().toISOString(),approved_by:item.approvedBy||item.reviewed_by||specialist,suggestion_status:item.status||item.suggestion_status||(item.edited?'edited_and_approved':'approved')}));
}

export const displayValue=value=>text(value)||'Not provided';
