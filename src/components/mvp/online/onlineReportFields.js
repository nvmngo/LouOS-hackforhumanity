export const onlineReportSections = [
  {number:'1',title:'About you',fields:[
    {id:'fullName',label:'Full name'},{id:'preferredName',label:'Preferred name'},{id:'age',label:'Age'},
    {id:'preferredLanguage',label:'Preferred language'},{id:'phoneOrContact',label:'Phone or contact'},
    {id:'safeContactPreference',label:'Safe contact preference',type:'radio',options:['Yes, call me','Text only','Never leave a message','Don’t contact me']},
    {id:'childrenDependants',label:'Children or dependants (how many, and ages)',type:'textarea'},
    {id:'currentAccommodation',label:'Current accommodation (where are you staying?)',type:'textarea'},
    {id:'stayDuration',label:'How long can you stay there?'},
    {id:'safeToday',label:'Are you safe there today?',type:'radio',options:['Yes','No','Unsure']}
  ]},
  {number:'2',title:'Current problems or crises',note:'Select everything that applies, then describe the main ones.',fields:[
    {id:'problemCategories',label:'Problems that apply',type:'checkboxes',options:['Housing','Domestic or family violence','Safety','Financial','Legal','Health or wellbeing','Employment','Family or children','Social support','Other']},
    ...[1,2,3].flatMap(number=>[{id:`problem${number}`,label:`Problem ${number}`,type:'textarea'},{id:`priority${number}`,label:`Problem ${number} priority`,type:'radio',options:['High','Medium','Low']}])
  ]},
  {number:'3',title:'What would you like help with today?',note:'The most important support you need first.',fields:[{id:'helpToday',label:'Support needed',type:'textarea'}]},
  {number:'4',title:'Your current situation',note:'Share as much or as little as you like.',fields:[{id:'reasonToday',label:'Why did you come to Lou’s Place today?',type:'textarea'},{id:'recentEvents',label:'What has been happening recently?',type:'textarea'}]},
  {number:'5',title:'Important information',note:'Optional.',fields:[{id:'urgentAttention',label:'Does anything need urgent attention today?',type:'textarea'},{id:'otherFacts',label:'Other facts that would help us support you',type:'textarea'}]},
  {number:'',title:'Confirmation',fields:[{id:'signature',label:'Your signature (type your full name)'},{id:'date',label:'Date',type:'date'}]}
];