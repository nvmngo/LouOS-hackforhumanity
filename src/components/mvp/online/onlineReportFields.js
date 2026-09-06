const priorityGuidance = {
  High: 'needs attention soon',
  Medium: 'important but not immediate',
  Low: 'something I would still like support with'
};

export const onlineReportSections = [
  {number:'1',title:'About you',fields:[
    {id:'fullName',label:'Full name',placeholder:'e.g. Sarah Williams'},
    {id:'preferredName',label:'Preferred name',placeholder:'e.g. Sarah, Sally, or the name you would like us to use'},
    {id:'age',label:'Age',type:'number',inputMode:'numeric',min:'0',placeholder:'e.g. 34'},
    {id:'preferredLanguage',label:'Preferred language',placeholder:'e.g. English, Arabic, Mandarin, Vietnamese'},
    {id:'phoneOrContact',label:'Phone or contact',type:'tel',helper:'Please provide a way we can contact you, if it is safe to do so.',placeholder:'e.g. 04XX XXX XXX or another safe contact method'},
    {id:'safeContactPreference',label:'Safe contact preference',type:'radio',helper:'Tell us how we can safely contact you.',options:['Yes, call me','Text only','Never leave a message',"Don't contact me"],wide:true},
    {id:'childrenDependants',label:'Children or dependants',subLabel:'How many, and ages',placeholder:'e.g. 2 children — ages 4 and 8',wide:true},
    {id:'currentAccommodation',label:'Current accommodation',subLabel:'Where are you staying?',type:'textarea',placeholder:'e.g. Staying with a friend, temporary accommodation, shelter, hotel, rental home, or no current accommodation'},
    {id:'stayDuration',label:'How long can you stay there?',placeholder:'e.g. Until Friday, about 2 weeks, unsure, or no time limit',wide:true},
    {id:'safeToday',label:'Are you safe there today?',type:'radio',helper:'Choose the option that best describes how you feel about your safety where you are currently staying.',options:['Yes','No','Unsure'],wide:true}
  ]},
  {number:'2',title:'Current problems or crises',note:'Select anything that is affecting you at the moment. You can select more than one.',fields:[
    {id:'problemCategories',label:'Areas you would like support with',type:'checkboxes',options:['Housing','Domestic or family violence','Safety','Financial','Legal','Health or wellbeing','Employment','Family or children','Social support','Other'],otherInputId:'problemCategoriesOther'},
    {id:'problem1',label:'Problem 1',type:'textarea',placeholder:'e.g. I need somewhere safe to stay after this week'},
    {id:'priority1',label:'Priority',type:'radio',options:['High','Medium','Low'],optionGuidance:priorityGuidance,wide:true},
    {id:'problem2',label:'Problem 2',type:'textarea',placeholder:'e.g. I am having difficulty paying rent and bills'},
    {id:'priority2',label:'Priority',type:'radio',options:['High','Medium','Low'],optionGuidance:priorityGuidance,wide:true},
    {id:'problem3',label:'Problem 3',type:'textarea',placeholder:'e.g. I need help understanding my legal options'},
    {id:'priority3',label:'Priority',type:'radio',options:['High','Medium','Low'],optionGuidance:priorityGuidance,wide:true}
  ]},
  {number:'3',title:'What would you like help with today?',fields:[
    {id:'helpToday',label:'What would you like help with today?',helper:'What is the most important thing you would like support with first?',type:'textarea',placeholder:'e.g. Finding safe accommodation, speaking with a caseworker, financial support, legal information, or understanding what support is available'}
  ]},
  {number:'4',title:'Your current situation',note:'Share as much or as little as you feel comfortable with.',fields:[
    {id:'reasonToday',label:'Why did you come to Lou’s Place today?',type:'textarea',placeholder:'e.g. I wanted to speak with someone about what support is available'},
    {id:'recentEvents',label:'What has been happening recently?',helper:'You can briefly tell us about anything that has changed or led you to seek support.',type:'textarea',rows:5,placeholder:'e.g. My living situation has changed recently and I am not sure where I can stay next week'}
  ]},
  {number:'5',title:'Important information',optional:true,fields:[
    {id:'urgentAttention',label:'Does anything need urgent attention today?',helper:'Tell us if there is something you think staff should know about as soon as possible.',type:'textarea',rows:5,placeholder:'e.g. I may not have somewhere safe to stay tonight'},
    {id:'otherFacts',label:'Other facts that would help us support you',helper:'Anything else you think would help a Lou’s Place staff member understand your situation.',type:'textarea',placeholder:'e.g. I have an appointment tomorrow, I need an interpreter, or there is a particular way you should contact me'}
  ]},
  {number:'6',title:'Date',fields:[
    {id:'date',label:'Date',type:'date',helper:'This defaults to today. You can change it if needed.',wide:true}
  ]}
];
