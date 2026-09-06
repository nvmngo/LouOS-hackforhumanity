import {jsPDF} from 'jspdf';

const ink='#332f2c',body='#5c554f',label='#8b8179',accent='#b3552f',hairline='#e7ded5',panel='#faf5f0',panelEdge='#ecdfd3';
const tones={immediate:['#f3d6cd','#93382a'],high:['#f3d6cd','#93382a'],medium:['#f1e4c7','#6f5420'],low:['#e5ece2','#4e6248'],neutral:['#ece5dd','#6b625b']};

const text=value=>Array.isArray(value)?value.filter(Boolean).join(' · '):value==null?'':String(value).trim();
const list=value=>(Array.isArray(value)?value:[value]).map(text).filter(Boolean);
const slug=value=>text(value).replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,40);
const sentence=value=>{const item=text(value);return item?item[0].toUpperCase()+item.slice(1):''};
const formatDate=value=>{const date=value instanceof Date?value:new Date(value||Date.now());return Number.isNaN(date.getTime())?text(value):date.toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'})};
const fields=(...rows)=>rows.filter(row=>text(row[1])).map(row=>[row[0],text(row[1])]);

export const reportFileName=(caseId,clientName)=>`LouOS-${slug(caseId)||'case'}${clientName?`-${slug(clientName)}`:''}-report.pdf`;

// The A–M skeleton of the living case report. Every heading is kept even when a
// section is empty, so a printed file always matches the on-screen record.
const reportModel=report=>{
  const{caseOverview:overview={},clientInformation:client={},presentingSituation:situation={},safety={},supportNeeds:needs={},background={},clientGoals:goals={},consultation={},supportPlan:plan={},followUp={},closure={}}=report||{};
  const closed=text(overview.status)==='Closed';
  return[
    ['A','Case Overview',[{type:'fields',rows:fields(['Assigned specialist',overview.assignedSpecialist],['Status',overview.status],['Urgency',sentence(overview.urgency)],['Preferred language',overview.preferredLanguage],['Preferred contact',overview.preferredContactMethod])}]],
    ['B','Client Information',[{type:'fields',rows:fields(['Full name',client.fullName],['Preferred name',client.preferredName],['Age',client.age],['Pronouns',client.pronouns],['Phone',client.phone],['Email',client.email],['Dependants',client.dependants],['Accommodation',client.accommodation],['Safe to contact',client.safeToContact],['Contact instructions',client.contactInstructions])}]],
    ['C','Presenting Situation',[{type:'text',value:situation.summary},{type:'fields',rows:fields(['Recent changes',situation.recentChanges])}]],
    ['D','Safety & Immediate Concerns',[{type:'fields',rows:fields(['Safety level',safety.level])},{type:'bullets',title:'Concerns',items:list(safety.concerns)},{type:'fields',rows:fields(['Notes',safety.notes],['Sources',list(safety.sources).join(' · ')])}]],
    ['E','Identified Support Needs',[{type:'fields',rows:fields(['Primary need',needs.primaryNeed])},{type:'bullets',title:'Secondary needs',items:list(needs.secondaryNeeds)},{type:'fields',rows:fields(['Client priority',needs.clientPriority])}]],
    ['F','Relevant Background',[{type:'fields',rows:fields(['Previous support',background.previousSupport],['Existing services',background.existingServices],['Support network',background.supportNetwork],['Financial situation',background.financialSituation],['Employment situation',background.employmentSituation],['Health information',background.healthInformation],['Legal matters',background.legalMatters],['Previous incidents',background.previousIncidents],['Other',background.other])}]],
    ['G','Client Goals & Preferences',[{type:'fields',rows:fields(['Immediate goal',goals.immediateGoal],['Longer-term goal',goals.longerTermGoal],['Preferred support',goals.preferredSupport],['Concerns',goals.concerns],['Preferences',goals.preferences],['Declined support',goals.declinedSupport])}]],
    ['H','Consultation Summary',[{type:'bullets',title:'Client reported',items:list(consultation.clientReported)},{type:'bullets',title:'Discussed',items:list(consultation.discussion)},{type:'bullets',title:'Outcome',items:list(consultation.outcome)}]],
    ['I','Support Plan / Agreed Solution',[{type:'fields',rows:fields(['Agreed priority',plan.agreedPriority],['Agreed solution',plan.agreedSolution],['Client agreement',plan.clientAgreement],['Service commitment',plan.serviceCommitment],['Backup plan',plan.backupPlan])},{type:'bullets',title:'Agreed referrals',items:list(plan.agreedReferrals)}]],
    ['J','Actions & Responsibilities',[{type:'items',items:(report?.actions||[]).map(item=>({title:text(item.description),meta:[text(item.responsiblePerson),text(item.dueDate)&&`Due ${text(item.dueDate)}`,text(item.outcome)].filter(Boolean).join(' · '),tag:text(item.status)}))}]],
    ['K','Referrals & External Services',[{type:'items',items:(report?.referrals||[]).map(item=>({title:text(item.organisation),meta:[text(item.reason),text(item.consent)&&`Consent: ${text(item.consent)}`,text(item.referralDate),text(item.outcome)].filter(Boolean).join(' · '),tag:text(item.status)}))}]],
    ['L','Follow-Up Plan',[{type:'fields',rows:fields(['Next contact',followUp.nextContactDate],['Contact method',followUp.contactMethod],['Purpose',followUp.purpose],['Responsible',followUp.responsibleSpecialist],['Outstanding matters',followUp.outstandingMatters],['Review required',followUp.reviewRequired])}]],
    ['M','Case Outcome / Closure',closed?[{type:'fields',rows:fields(['Outcome achieved',closure.outcomeAchieved],['Support delivered',closure.supportDelivered],['Remaining concerns',closure.remainingConcerns],['Continuing referrals',closure.continuingReferrals],['Closure reason',closure.closureReason],['Closure date',closure.closureDate],['Client informed',closure.clientInformed])}]:[{type:'note',value:'Not applicable while the case is active.'}]]
  ];
};

const fallbackModel=(sections=[])=>sections.map(([title,value],index)=>[String.fromCharCode(65+index),text(title).replace(/^[A-Z]\.\s*/,''),[{type:'text',value}]]);

/**
 * Lays the finalised case report out as text (rather than a canvas capture) so the
 * exported file stays selectable, searchable, and small enough to attach to a record.
 *
 * @param {{clientName?:string,caseId?:string,specialistName?:string,status?:string,urgency?:string,openedDate?:string,report?:any,sections?:Array<[string,any]>,generatedAt?:Date|string}} input
 */
export function buildCaseReportPdf({clientName,caseId,specialistName,status,urgency,openedDate,report,sections,generatedAt=new Date()}={}){
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const width=doc.internal.pageSize.getWidth(),height=doc.internal.pageSize.getHeight();
  const margin=56,column=width-margin*2,labelWidth=130,valueLeft=margin+labelWidth,valueWidth=column-labelWidth,footer=height-margin+8;
  const overview=report?.caseOverview||{};
  const heading=text(clientName)||text(report?.clientInformation?.fullName)||'Client';
  const reference=text(caseId)||text(overview.caseId);
  const state=text(status)||text(overview.status);
  const priority=text(urgency)||text(overview.urgency);
  let y=margin;

  const face=(style,size,color)=>{doc.setFont(style==='serif'?'times':'helvetica',size.style||'normal');doc.setFontSize(size.size||size);doc.setTextColor(color)};
  const turn=()=>{doc.addPage();y=margin+18};
  const ensure=needed=>{if(y+needed>height-margin-14)turn()};
  const lines=(value,size,style,fontWidth)=>{doc.setFont('helvetica',style);doc.setFontSize(size);return doc.splitTextToSize(text(value),fontWidth)};

  const paragraph=(value,{x=margin,fontWidth=column,size=10,style='normal',font='helvetica',color=body,lead=14.5,gap=0})=>{
    doc.setFont(font,style);doc.setFontSize(size);doc.setTextColor(color);
    for(const line of doc.splitTextToSize(text(value),fontWidth)){ensure(lead);doc.text(line,x,y);y+=lead}
    y+=gap;
  };

  const chipWidth=value=>{doc.setFont('helvetica','bold');doc.setFontSize(7.5);const caption=text(value).toUpperCase();return doc.getTextWidth(caption)+2.6*caption.length+16};
  const chip=(value,tone,right,baseline)=>{
    const caption=text(value).toUpperCase(),box=chipWidth(value),top=baseline===undefined?y:baseline;
    doc.setFillColor(tone[0]);doc.roundedRect(right-box,top-10,box,17,8.5,8.5,'F');
    doc.setTextColor(tone[1]);doc.text(caption,right-box+8,top+1.5,{charSpace:1.3});
    return box+7;
  };

  // Masthead
  face('sans',{size:8.5,style:'bold'},accent);
  doc.text('LOU’S PLACE · LOUOS',margin,y,{charSpace:1.5});
  let right=width-margin;
  if(priority)right-=chip(priority,tones[priority.toLowerCase()]||tones.neutral,right);
  if(state)chip(state,tones.neutral,right);
  y+=26;
  face('serif',{size:25,style:'bold'},ink);doc.text(heading,margin,y);y+=17;
  face('sans',{size:10.5},label);doc.text('Structured Case Support Report',margin,y);y+=16;

  // Document panel
  const meta=fields(['Case reference',reference],['Opened',openedDate||overview.openedDate],['Specialist',specialistName||overview.assignedSpecialist],['Generated',formatDate(generatedAt)]);
  if(meta.length){
    const rows=Math.ceil(meta.length/2),panelHeight=rows*30+12;
    doc.setFillColor(panel);doc.setDrawColor(panelEdge);doc.setLineWidth(.7);
    doc.roundedRect(margin,y,column,panelHeight,7,7,'FD');
    meta.forEach(([key,value],index)=>{
      const x=margin+18+(index%2)*(column/2),top=y+24+Math.floor(index/2)*30;
      face('sans',{size:7.5,style:'bold'},label);doc.text(key.toUpperCase(),x,top,{charSpace:.8});
      face('sans',{size:10},ink);doc.text(doc.splitTextToSize(value,column/2-30)[0],x,top+13);
    });
    y+=panelHeight+26;
  }

  const model=report?reportModel(report):fallbackModel(sections);
  model.forEach(([letter,title,blocks],index)=>{
    const filled=blocks.filter(block=>block.type==='fields'?block.rows.length:block.type==='items'?block.items.length:block.type==='bullets'?block.items.length:text(block.value));
    ensure(index?74:56);
    if(index){doc.setDrawColor(hairline);doc.setLineWidth(.7);doc.line(margin,y-18,width-margin,y-18)}
    doc.setFillColor('#f4e3d9');doc.roundedRect(margin,y-11,19,19,5,5,'F');
    face('sans',{size:10,style:'bold'},accent);doc.text(letter,margin+9.5,y+2.5,{align:'center'});
    face('serif',{size:14,style:'bold'},ink);doc.text(title,margin+29,y+2.5);
    y+=26;

    if(!filled.length){paragraph('Not recorded.',{size:9.5,style:'italic',color:label,gap:16});return}
    for(const block of filled){
      if(block.type==='fields'){
        for(const[key,value]of block.rows){
          const wrapped=lines(value,10,'normal',valueWidth);
          ensure(Math.min(wrapped.length,3)*14.5);
          face('sans',{size:7.5,style:'bold'},label);doc.text(key.toUpperCase(),margin,y,{charSpace:.8});
          face('sans',{size:10},body);
          const start=y;
          wrapped.forEach((line,position)=>{if(position)ensure(14.5);doc.text(line,valueLeft,y);y+=14.5});
          y=Math.max(y,start+14.5)+3.5;
        }
        y+=6;
      }
      if(block.type==='bullets'){
        if(block.title){ensure(16);face('sans',{size:7.5,style:'bold'},label);doc.text(text(block.title).toUpperCase(),margin,y,{charSpace:.8});y+=13}
        for(const item of block.items){
          const wrapped=lines(item,10,'normal',column-30);
          ensure(14.5);
          doc.setFillColor(accent);doc.circle(margin+8,y-3.2,1.7,'F');
          face('sans',{size:10},body);
          wrapped.forEach((line,position)=>{if(position)ensure(14.5);doc.text(line,margin+18,y);y+=14.5});
        }
        y+=10;
      }
      if(block.type==='items'){
        for(const item of block.items){
          const gutter=item.tag?chipWidth(item.tag)+14:0,itemWidth=column-24-gutter;
          const wrapped=lines(item.title,10.5,'bold',itemWidth);
          ensure(wrapped.length*15+(item.meta?14:0));
          const top=y;
          face('sans',{size:10.5,style:'bold'},ink);
          wrapped.forEach((line,position)=>{if(position)ensure(15);doc.text(line,margin+12,y);y+=15});
          if(item.tag)chip(item.tag,tones.neutral,width-margin,top);
          if(item.meta)paragraph(item.meta,{x:margin+12,fontWidth:itemWidth,size:9,color:label,lead:13});
          doc.setDrawColor(panelEdge);doc.setLineWidth(2);doc.line(margin+2,top-10,margin+2,y-6);
          y+=12;
        }
      }
      if(block.type==='text')paragraph(block.value,{gap:12});
      if(block.type==='note')paragraph(block.value,{size:9.5,style:'italic',color:label,gap:12});
    }
  });

  const pages=doc.getNumberOfPages(),running=[heading,reference].filter(Boolean).join(' · ');
  for(let page=1;page<=pages;page+=1){
    doc.setPage(page);
    doc.setDrawColor(hairline);doc.setLineWidth(.7);doc.line(margin,footer-14,width-margin,footer-14);
    face('sans',{size:7.5},label);
    doc.text('Confidential client record · Lou’s Place',margin,footer);
    doc.text(`Page ${page} of ${pages}`,width-margin,footer,{align:'right'});
    if(page>1){
      doc.text(running,margin,margin-14);
      doc.setDrawColor(hairline);doc.line(margin,margin-6,width-margin,margin-6);
    }
  }
  return doc;
}

export function downloadCaseReportPdf(report){
  const doc=buildCaseReportPdf(report);
  doc.save(reportFileName(report?.caseId,report?.clientName));
  return doc;
}
