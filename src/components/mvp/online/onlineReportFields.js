export const supportAreaOptions = [
  'Somewhere to live',
  'Safety',
  'Money',
  'Health, or how I’m feeling',
  'Family or children',
  'Legal help',
  'Work or study',
  'Feeling alone',
  'Something else'
];

export const onlineReportSections = [
  {number:'1',title:'About you',fields:[
    {id:'fullName',label:'Your name'},
    {id:'preferredName',label:'What should we call you?'},
    {id:'age',label:'Age',type:'number',inputMode:'numeric',min:'0'},
    {id:'preferredLanguage',label:'Language you prefer'},
    {id:'phoneOrContact',label:'Phone',subLabel:'optional',type:'tel'},
    {id:'hasChildren',countId:'childrenCount',label:'Do you have any children?',type:'children',options:['No','Yes'],countLabel:'how many?'},
    {id:'currentAccommodation',label:'Where are you staying now?',wide:true},
    {id:'stayDuration',label:'How long can you stay there?',subLabel:'roughly',wide:true}
  ]},
  {number:'2',title:'What’s going on right now',note:'Tick anything that applies.',fields:[
    {id:'supportAreas',label:'',ariaLabel:'Support areas',type:'checkboxes',options:supportAreaOptions,otherInputId:'supportOther',otherOption:'Something else'}
  ]},
  {number:'3',title:'Your situation',fields:[
    {id:'reasonToday',label:'Why did you come to Lou’s Place today?',type:'textarea',rows:3}
  ]},
  {number:'4',title:'Anything else',fields:[
    {id:'otherHelp',label:'Is there anything else we can help you with?',type:'textarea',rows:3}
  ]},
  {title:'Please sign below',confirmation:true,fields:[
    {id:'signature',label:'Your signature',helper:'Type your name as your signature.'},
    {id:'date',label:'Today’s date',type:'date'}
  ]}
];
