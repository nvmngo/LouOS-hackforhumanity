export const onlineReportSections = [
  {number:'1',title:'About you',fields:[
    {id:'fullName',label:'Your name'},
    {id:'preferredName',label:'What should we call you?'},{id:'age',label:'Age'},
    {id:'preferredLanguage',label:'Language you prefer'},{id:'phoneOrContact',label:'Phone (optional)'},
    {id:'childrenDependants',label:'Do you have any children?',type:'conditionalCount',yesId:'hasChildren'},
    {id:'currentAccommodation',label:'Where are you staying now?',type:'textarea'},
    {id:'stayDuration',label:'How long can you stay there? (roughly)',type:'textarea'}
  ]},
  {number:'2',title:'What’s going on right now',note:'Tick anything that applies.',fields:[
    {id:'problemCategories',label:'',type:'checkboxes',options:['Somewhere to live','Safety','Money','Health, or how I’m feeling','Family or children','Legal help','Work or study','Feeling alone','Something else']}
  ]},
  {number:'3',title:'Your situation',fields:[
    {id:'reasonToday',label:'Why did you come to Lou’s Place today?',type:'textarea'}
  ]},
  {number:'4',title:'Anything else',fields:[
    {id:'helpToday',label:'Is there anything else we can help you with?',type:'textarea'}
  ]}
];