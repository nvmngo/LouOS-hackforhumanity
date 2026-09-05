const clone = value => JSON.parse(JSON.stringify(value));
const upsertProblem = (problems, category, priority, description) => {
  const next = problems.filter(item => item.category !== category);
  return [...next, { category, priority, description }];
};
const addFact = (facts, fact) => fact && !facts.includes(fact) ? [...facts, fact] : facts;
const moneyText = text => text.match(/(?:\$|about |around |approximately )?(\d{2,5})\s*(?:dollars?)?/i)?.[1];
export const initialDraft = () => ({
  caseInformation:{caseId:`LP-2026-${String(Math.floor(10000+Math.random()*89999))}`,date:new Date().toLocaleDateString('en-AU'),status:'New',urgency:''},
  client:{name:'',preferredName:'',age:'',preferredLanguage:'',contact:'',safeContactPreference:'',dependants:'',accommodation:''},
  problems:[],mainSupportNeed:'',caseDescription:'',keyInformation:[],
  caseworker:{name:'Maya Chen',role:'Senior Caseworker',specialisation:'Housing and family safety'},
  interviewState:{reason:'',potentialRelationship:false,possibleSafety:false,complete:false}
});
export const questions = {
  name:"What is the client's name?", preferredName:name=>`What would ${name||'the client'} prefer to be called?`, age:name=>`How old is ${name||'the client'}?`,
  language:name=>`What language does ${name||'the client'} prefer?`, contact:name=>`What is the best way to contact ${name||'the client'}?`,
  reason:"What brought the client to Lou's Place today?", relationshipSafety:'Was leaving the partner related to domestic or family violence, or is that not part of this case?',
  accommodation:name=>`Where is ${name||'the client'} staying now, and how long can they remain there?`, safety:name=>`Is ${name||'the client'} safe where they are staying tonight?`,
  dependants:'Are any children or dependants involved?', finance:'Is there any income or financial support relevant today?',
  mainNeed:name=>`What does ${name||'the client'} most need help with today?`, safeContact:name=>`Is it safe for Lou's Place to contact ${name||'the client'} by phone or message?`,
  urgency:'How would you rate the urgency: low, medium, high, or immediate?'
};
export function applyAnswer(draft, questionId, text){
  const next=clone(draft), lower=text.toLowerCase(), name=next.client.preferredName||next.client.name.split(' ')[0];
  if(questionId==='name')next.client.name=text.trim();
  if(questionId==='preferredName')next.client.preferredName=/^(same|yes|that)/i.test(text)?name:text.trim();
  if(questionId==='age')next.client.age=text.match(/\d{1,3}/)?.[0]||text.trim();
  if(questionId==='language')next.client.preferredLanguage=text.trim();
  if(questionId==='contact')next.client.contact=text.trim();
  if(questionId==='reason')next.interviewState.reason=text.trim();
  if(questionId==='accommodation')next.client.accommodation=text.trim();
  if(questionId==='dependants')next.client.dependants=text.trim();
  if(questionId==='safeContact')next.client.safeContactPreference=text.trim();
  if(questionId==='urgency')next.caseInformation.urgency=['immediate','high','medium','low'].find(x=>lower.includes(x))?.replace(/^./,c=>c.toUpperCase())||text.trim();
  if(/actually.*\b\d{2}\b/i.test(text)){next.client.age=text.match(/\b\d{2}\b/)?.[0]||next.client.age;}
  if(/friend|temporary|no(?:where)? to (?:stay|go)|accommodation|housing/i.test(text)){const desc=questionId==='accommodation'?text.trim():'Client does not currently have stable accommodation.';next.problems=upsertProblem(next.problems,'Housing','High',desc);}
  if(/centrelink|financial|money|\$|dollars?/i.test(text)){const amount=moneyText(text);const desc=`${/centrelink/i.test(text)?'Centrelink is active. ':''}${amount?`Approximately $${amount} is currently available.`:'Financial support is relevant to the current case.'}`.trim();next.problems=upsertProblem(next.problems,'Financial','Medium',desc);if(/centrelink/i.test(text))next.keyInformation=addFact(next.keyInformation,'Centrelink is active');if(amount)next.keyInformation=addFact(next.keyInformation,`Approximately $${amount} available`);}
  if(/\b(child|children|kids?|dependants?)\b/i.test(text))next.keyInformation=addFact(next.keyInformation,text.trim());
  if(/left (?:her |his |their )?partner/i.test(text))next.interviewState.potentialRelationship=true;
  if(questionId==='relationshipSafety'&&!/not part|no\b/i.test(lower)){next.problems=upsertProblem(next.problems,'Domestic / Family Violence','High',text.trim());next.interviewState.possibleSafety=true;}
  if(questionId==='safety'){if(/\b(no|unsafe|danger|threat|immediate)\b/i.test(lower)){next.problems=upsertProblem(next.problems,'Safety','Immediate','A possible immediate safety concern was identified.');next.interviewState.possibleSafety=true;}else next.keyInformation=addFact(next.keyInformation,'Safe accommodation is available tonight');}
  if(/legal/i.test(text)){next.problems=upsertProblem(next.problems,'Legal',/don.t want|not now|no legal/i.test(lower)?'Low':'Medium',/don.t want|not now|no legal/i.test(lower)?'Client does not currently want legal assistance.':text.trim());}
  if(questionId==='mainNeed'){next.mainSupportNeed=text.trim();next.keyInformation=addFact(next.keyInformation,`${text.trim()} is the current priority`);}
  return regenerate(next);
}
export function nextQuestion(draft,current){const n=draft.client.preferredName||draft.client.name.split(' ')[0];const order={name:'preferredName',preferredName:'age',age:'language',language:'contact',contact:'reason'};if(order[current])return{id:order[current],text:typeof questions[order[current]]==='function'?questions[order[current]](n):questions[order[current]]};if(current==='reason'){if(draft.interviewState.potentialRelationship)return{id:'relationshipSafety',text:questions.relationshipSafety};if(draft.problems.some(x=>x.category==='Housing'))return{id:'accommodation',text:questions.accommodation(n)};return{id:'mainNeed',text:questions.mainNeed(n)};}if(current==='relationshipSafety')return draft.problems.some(x=>x.category==='Housing')?{id:'accommodation',text:questions.accommodation(n)}:{id:'mainNeed',text:questions.mainNeed(n)};if(current==='accommodation')return{id:'safety',text:questions.safety(n)};if(current==='safety'&&!draft.client.dependants)return{id:'dependants',text:questions.dependants};if(current==='dependants'&&draft.problems.some(x=>x.category==='Financial'))return{id:'finance',text:questions.finance};if(['dependants','finance','safety'].includes(current)&&!draft.mainSupportNeed)return{id:'mainNeed',text:questions.mainNeed(n)};if(current==='mainNeed'&&draft.interviewState.possibleSafety)return{id:'safeContact',text:questions.safeContact(n)};if(current!=='urgency')return{id:'urgency',text:questions.urgency};return null;}
export function regenerate(draft){const n=draft.client.preferredName||draft.client.name||'The client';const parts=[];if(draft.interviewState.reason)parts.push(`${n} came to Lou's Place because ${draft.interviewState.reason.charAt(0).toLowerCase()+draft.interviewState.reason.slice(1)}`);if(draft.client.accommodation)parts.push(`Current accommodation: ${draft.client.accommodation}`);if(draft.client.dependants)parts.push(`Dependants: ${draft.client.dependants}`);if(draft.problems.some(x=>x.category==='Financial'))parts.push(draft.problems.find(x=>x.category==='Financial').description);if(draft.mainSupportNeed)parts.push(`${n}'s immediate priority is ${draft.mainSupportNeed.charAt(0).toLowerCase()+draft.mainSupportNeed.slice(1)}`);draft.caseDescription=parts.slice(0,6).join('. ').replace(/\.\./g,'.')+(parts.length?'.':'');return draft;}
export function noteSuggestions(text){const out=[];if(/friend.*monday|monday.*friend/i.test(text))out.push({area:'Housing',action:'Update',text:'Temporary accommodation is available until Monday.'});if(/centrelink/i.test(text))out.push({area:'Financial',action:'Add',text:'Centrelink is currently active.'});const amount=moneyText(text);if(amount)out.push({area:'Financial',action:'Add',text:`Approximately $${amount} is currently available.`});if(/legal.*(?:don.t|doesn.t|not)|(?:don.t|doesn.t).*legal/i.test(text))out.push({area:'Legal',action:'Update',text:'Client does not currently want legal assistance.'});if(/housing first|needs housing|stable accommodation/i.test(text))out.push({area:'Main Need',action:'Update',text:'Safe and stable accommodation.'});return out.map((x,i)=>({...x,id:Date.now()+i}));}
export function approveSuggestion(draft,item){const next=clone(draft);if(item.area==='Main Need')next.mainSupportNeed=item.text;else if(item.area==='Key Information')next.keyInformation=addFact(next.keyInformation,item.text);else{const existing=next.problems.find(x=>x.category===item.area),priority=existing?.priority||'Medium';if(item.action==='Remove')next.problems=next.problems.filter(x=>x.category!==item.area);else next.problems=upsertProblem(next.problems,item.area,priority,item.text);next.keyInformation=addFact(next.keyInformation,item.text);}return regenerate(next);}