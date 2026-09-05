import React from 'react';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const fields = [
  ['1. CASE INFORMATION — STAFF USE', ['Case ID:', 'Date:', 'Case status:  New / Active / Follow-up / Closed', 'Urgency:  Low / Medium / High / Immediate']],
  ['2. ABOUT YOU', ['Full name:', 'Preferred name:', 'Age:', 'Preferred language:', 'Phone or contact details:', 'Safe contact preference:', 'Children or dependants:', 'Current accommodation:', 'How long can you stay there?', 'Are you safe there today?  Yes / No / Unsure']],
  ['3. CURRENT PROBLEMS OR CRISES', ['Tick relevant areas: Housing / Domestic or Family Violence / Safety / Financial / Legal / Health or Wellbeing / Employment / Family or Children / Social Support / Other', 'Problem 1 and priority:', 'Problem 2 and priority:', 'Problem 3 and priority:']],
  ["4. WHAT WOULD YOU LIKE HELP WITH TODAY?", ['What is the most important support you need first?']],
  ['5. YOUR CURRENT SITUATION', ["Why did you come to Lou's Place today?", 'What has been happening recently?', 'Does anything need urgent attention today?']],
  ['6. IMPORTANT INFORMATION', ['Other facts that would help us support you:']],
  ['7. CASEWORKER — STAFF USE', ['Caseworker name:', 'Role:', 'Relevant specialisation:']]
];

export default function BlankIntakePdfButton(){const download=()=>{const doc=new jsPDF({unit:'mm',format:'a4'});let y=18;doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text("LOU'S PLACE — CLIENT INTAKE FORM",15,y);y+=8;doc.setFont('helvetica','normal');doc.setFontSize(10);doc.text('Please write clearly. A staff member can help you complete this form.',15,y);y+=10;fields.forEach(([heading,questions])=>{if(y>267){doc.addPage();y=18}doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(heading,15,y);y+=7;doc.setFont('helvetica','normal');doc.setFontSize(10);questions.forEach(question=>{const lines=doc.splitTextToSize(question,180);if(y+lines.length*5+12>282){doc.addPage();y=18}doc.text(lines,15,y);y+=lines.length*5;for(let i=0;i<(question.includes('Tick relevant')?1:2);i++){doc.line(15,y+3,195,y+3);y+=7}y+=3});});doc.save('Lous-Place-Blank-Intake-Form.pdf')};return <button type="button" className="mvp-btn light full" onClick={download}><Download size={18}/>Download blank intake form PDF</button>}