export const onlineLanguages=[
  {code:'en',label:'English',englishName:'English'},
  {code:'vi',label:'Tiếng Việt',englishName:'Vietnamese'},
  {code:'zh',label:'中文',englishName:'Chinese'},
  {code:'ar',label:'العربية',englishName:'Arabic',dir:'rtl'},
  {code:'es',label:'Español',englishName:'Spanish'},
  {code:'ko',label:'한국어',englishName:'Korean'}
];

const categories=['Housing','Safety','Financial','Health or wellbeing','Family or children','Legal','Employment','Social support','Other'];

const content={
  en:{
    formTitle:'Welcome form',org:'Lou’s Place',
    leadStrong:'Take your time, and leave blank anything you’d rather not answer.',
    leadRest:'Someone on our team is happy to help you fill this in.',
    languageLabel:'Choose your language',
    sections:{about:'About you',now:'What’s going on right now',situation:'Your situation',anything:'Anything else'},
    tick:'Tick anything that applies.',
    children:{no:'No',yes:'Yes',ask:'how many?'},
    other:{label:'Please tell us more',placeholder:'e.g. Another concern you would like support with'},
    actions:{submit:'Submit form',busy:'Preparing summary…',cancel:'Cancel'},
    validation:{required:'Required',error:'Please answer this question.',errorTick:'Please choose at least one.',errorSummary:'Please answer the highlighted questions before you send the form.',toTop:'Back to top'},
    options:['Somewhere to live','Safety','Money','Health, or how I’m feeling','Family or children','Legal help','Work or study','Feeling alone','Something else'],
    fields:{
      fullName:{label:'Your name',placeholder:'e.g. Sarah Williams'},
      preferredName:{label:'What should we call you?',placeholder:'e.g. Sarah, Sally, or the name you would like us to use'},
      age:{label:'Age',placeholder:'e.g. 34'},
      preferredLanguage:{label:'Language you prefer',placeholder:'e.g. English, Arabic, Mandarin, Vietnamese'},
      phoneOrContact:{label:'Phone',subLabel:'Optional',helper:'Only if it is safe for us to contact you here.',placeholder:'e.g. 04XX XXX XXX'},
      childrenDependants:{label:'Do you have any children?'},
      currentAccommodation:{label:'Where are you staying now?',placeholder:'e.g. With a friend, temporary accommodation, a shelter, a rental home, or nowhere at the moment'},
      stayDuration:{label:'How long can you stay there?',helper:'Roughly is fine.',placeholder:'e.g. Until Friday, about 2 weeks, or I am not sure'},
      reasonToday:{label:'Why did you come to Lou’s Place today?',placeholder:'e.g. I wanted to speak with someone about what support is available'},
      otherFacts:{label:'Is there anything else we can help you with?',placeholder:'e.g. I need an interpreter, or I have an appointment tomorrow'}
    }
  },
  vi:{
    formTitle:'Phiếu chào đón',org:'Lou’s Place',
    leadStrong:'Bạn cứ từ từ, và có thể bỏ trống bất kỳ câu nào bạn không muốn trả lời.',
    leadRest:'Nhân viên của chúng tôi rất sẵn lòng giúp bạn điền phiếu này.',
    languageLabel:'Chọn ngôn ngữ của bạn',
    sections:{about:'Về bạn',now:'Điều gì đang xảy ra lúc này',situation:'Hoàn cảnh của bạn',anything:'Điều gì khác'},
    tick:'Đánh dấu bất kỳ mục nào phù hợp.',
    children:{no:'Không',yes:'Có',ask:'bao nhiêu cháu?'},
    other:{label:'Vui lòng cho chúng tôi biết thêm',placeholder:'ví dụ: Một vấn đề khác bạn muốn được hỗ trợ'},
    actions:{submit:'Gửi phiếu',busy:'Đang chuẩn bị bản tóm tắt…',cancel:'Hủy'},
    validation:{required:'Bắt buộc',error:'Vui lòng trả lời câu hỏi này.',errorTick:'Vui lòng chọn ít nhất một mục.',errorSummary:'Vui lòng trả lời các câu được đánh dấu trước khi gửi phiếu.',toTop:'Lên đầu trang'},
    options:['Chỗ ở','An toàn','Tiền bạc','Sức khỏe, hoặc cảm xúc của tôi','Gia đình hoặc con cái','Trợ giúp pháp lý','Việc làm hoặc học tập','Cảm thấy cô đơn','Điều gì khác'],
    fields:{
      fullName:{label:'Tên của bạn',placeholder:'ví dụ: Nguyễn Thị Lan'},
      preferredName:{label:'Chúng tôi nên gọi bạn là gì?',placeholder:'ví dụ: Lan, cô Lan, hoặc tên bạn muốn chúng tôi dùng'},
      age:{label:'Tuổi',placeholder:'ví dụ: 34'},
      preferredLanguage:{label:'Ngôn ngữ bạn muốn dùng',placeholder:'ví dụ: Tiếng Việt, Tiếng Anh, Tiếng Trung'},
      phoneOrContact:{label:'Điện thoại',subLabel:'Không bắt buộc',helper:'Chỉ khi bạn thấy an toàn để chúng tôi liên lạc.',placeholder:'ví dụ: 04XX XXX XXX'},
      childrenDependants:{label:'Bạn có con không?'},
      currentAccommodation:{label:'Hiện tại bạn đang ở đâu?',placeholder:'ví dụ: Ở nhà bạn bè, nơi ở tạm, nhà tạm lánh, nhà thuê, hoặc chưa có chỗ ở'},
      stayDuration:{label:'Bạn có thể ở đó bao lâu?',helper:'Khoảng chừng là được.',placeholder:'ví dụ: Đến thứ Sáu, khoảng 2 tuần, hoặc tôi không chắc'},
      reasonToday:{label:'Vì sao hôm nay bạn đến Lou’s Place?',placeholder:'ví dụ: Tôi muốn nói chuyện với ai đó về những hỗ trợ hiện có'},
      otherFacts:{label:'Chúng tôi có thể giúp bạn điều gì khác không?',placeholder:'ví dụ: Tôi cần người phiên dịch, hoặc tôi có hẹn vào ngày mai'}
    }
  },
  zh:{
    formTitle:'欢迎表',org:'Lou’s Place',
    leadStrong:'请慢慢来，不想回答的问题可以留空。',
    leadRest:'我们的团队很乐意帮您填写。',
    languageLabel:'选择您的语言',
    sections:{about:'关于您',now:'您目前的情况',situation:'您的处境',anything:'其他事项'},
    tick:'请勾选所有适用的项目。',
    children:{no:'没有',yes:'有',ask:'有几个？'},
    other:{label:'请告诉我们更多',placeholder:'例如：您希望得到帮助的另一个问题'},
    actions:{submit:'提交表格',busy:'正在准备摘要…',cancel:'取消'},
    validation:{required:'必填',error:'请回答此问题。',errorTick:'请至少选择一项。',errorSummary:'请先回答标记的问题，然后再提交表格。',toTop:'回到顶部'},
    options:['住的地方','安全','金钱','健康，或我的感受','家庭或孩子','法律帮助','工作或学习','感到孤单','其他事情'],
    fields:{
      fullName:{label:'您的姓名',placeholder:'例如：王秀英'},
      preferredName:{label:'我们该怎么称呼您？',placeholder:'例如：秀英、王阿姨，或您希望我们使用的称呼'},
      age:{label:'年龄',placeholder:'例如：34'},
      preferredLanguage:{label:'您偏好的语言',placeholder:'例如：中文、英文、越南语'},
      phoneOrContact:{label:'电话',subLabel:'可不填',helper:'只有在您认为安全时才留下联系方式。',placeholder:'例如：04XX XXX XXX'},
      childrenDependants:{label:'您有孩子吗？'},
      currentAccommodation:{label:'您现在住在哪里？',placeholder:'例如：住在朋友家、临时住所、庇护所、租房，或目前没有住处'},
      stayDuration:{label:'您可以在那里住多久？',helper:'大概即可。',placeholder:'例如：住到星期五、大约两周，或我不确定'},
      reasonToday:{label:'您今天为什么来 Lou’s Place？',placeholder:'例如：我想找人谈谈可以获得哪些帮助'},
      otherFacts:{label:'还有其他我们可以帮您的事情吗？',placeholder:'例如：我需要翻译，或我明天有预约'}
    }
  },
  ar:{
    formTitle:'استمارة الترحيب',org:'Lou’s Place',
    leadStrong:'خذ وقتك، واترك فارغًا أي سؤال لا ترغب في الإجابة عنه.',
    leadRest:'يسعد أحد أعضاء فريقنا بمساعدتك في تعبئة هذه الاستمارة.',
    languageLabel:'اختر لغتك',
    sections:{about:'عنك',now:'ما الذي يحدث الآن',situation:'وضعك الحالي',anything:'أي شيء آخر'},
    tick:'اختر كل ما ينطبق عليك.',
    children:{no:'لا',yes:'نعم',ask:'كم عددهم؟'},
    other:{label:'أخبرنا المزيد من فضلك',placeholder:'مثال: مشكلة أخرى ترغب في الحصول على دعم بشأنها'},
    actions:{submit:'إرسال الاستمارة',busy:'جارٍ تحضير الملخص…',cancel:'إلغاء'},
    validation:{required:'مطلوب',error:'يرجى الإجابة عن هذا السؤال.',errorTick:'يرجى اختيار خيار واحد على الأقل.',errorSummary:'يرجى الإجابة عن الأسئلة المميزة قبل إرسال الاستمارة.',toTop:'العودة إلى الأعلى'},
    options:['مكان للسكن','الأمان','المال','الصحة، أو ما أشعر به','العائلة أو الأطفال','مساعدة قانونية','العمل أو الدراسة','الشعور بالوحدة','شيء آخر'],
    fields:{
      fullName:{label:'اسمك',placeholder:'مثال: سارة وليامز'},
      preferredName:{label:'بماذا تحب أن نناديك؟',placeholder:'مثال: سارة، أم أحمد، أو الاسم الذي تفضله'},
      age:{label:'العمر',placeholder:'مثال: 34'},
      preferredLanguage:{label:'اللغة التي تفضلها',placeholder:'مثال: العربية، الإنجليزية، الفيتنامية'},
      phoneOrContact:{label:'الهاتف',subLabel:'اختياري',helper:'فقط إذا كان من الآمن أن نتواصل معك عليه.',placeholder:'مثال: 04XX XXX XXX'},
      childrenDependants:{label:'هل لديك أطفال؟'},
      currentAccommodation:{label:'أين تقيم حاليًا؟',placeholder:'مثال: عند صديق، سكن مؤقت، مأوى، منزل مستأجر، أو لا يوجد مكان حاليًا'},
      stayDuration:{label:'كم يمكنك البقاء هناك؟',helper:'تقريبًا يكفي.',placeholder:'مثال: حتى يوم الجمعة، حوالي أسبوعين، أو لست متأكدًا'},
      reasonToday:{label:'لماذا أتيت إلى Lou’s Place اليوم؟',placeholder:'مثال: أردت التحدث مع شخص عن الدعم المتاح'},
      otherFacts:{label:'هل هناك شيء آخر يمكننا مساعدتك فيه؟',placeholder:'مثال: أحتاج إلى مترجم، أو لدي موعد غدًا'}
    }
  },
  es:{
    formTitle:'Formulario de bienvenida',org:'Lou’s Place',
    leadStrong:'Tómese su tiempo y deje en blanco lo que prefiera no responder.',
    leadRest:'Alguien de nuestro equipo con gusto le ayuda a completarlo.',
    languageLabel:'Elija su idioma',
    sections:{about:'Sobre usted',now:'Qué está pasando ahora',situation:'Su situación',anything:'Algo más'},
    tick:'Marque todo lo que corresponda.',
    children:{no:'No',yes:'Sí',ask:'¿cuántos?'},
    other:{label:'Cuéntenos más',placeholder:'ej. Otra preocupación con la que quisiera apoyo'},
    actions:{submit:'Enviar formulario',busy:'Preparando el resumen…',cancel:'Cancelar'},
    validation:{required:'Obligatorio',error:'Por favor responda esta pregunta.',errorTick:'Por favor elija al menos una opción.',errorSummary:'Por favor responda las preguntas marcadas antes de enviar el formulario.',toTop:'Volver arriba'},
    options:['Un lugar donde vivir','Seguridad','Dinero','Salud, o cómo me siento','Familia o hijos','Ayuda legal','Trabajo o estudios','Sentirme solo','Algo más'],
    fields:{
      fullName:{label:'Su nombre',placeholder:'ej. Sarah Williams'},
      preferredName:{label:'¿Cómo le gustaría que le llamemos?',placeholder:'ej. Sarah, Sally, o el nombre que prefiera'},
      age:{label:'Edad',placeholder:'ej. 34'},
      preferredLanguage:{label:'Idioma que prefiere',placeholder:'ej. español, inglés, árabe'},
      phoneOrContact:{label:'Teléfono',subLabel:'Opcional',helper:'Solo si es seguro que le contactemos ahí.',placeholder:'ej. 04XX XXX XXX'},
      childrenDependants:{label:'¿Tiene hijos?'},
      currentAccommodation:{label:'¿Dónde se está quedando ahora?',placeholder:'ej. Con un amigo, alojamiento temporal, un refugio, una vivienda alquilada, o sin alojamiento'},
      stayDuration:{label:'¿Cuánto tiempo puede quedarse ahí?',helper:'Un aproximado está bien.',placeholder:'ej. Hasta el viernes, unas 2 semanas, o no estoy seguro'},
      reasonToday:{label:'¿Por qué vino hoy a Lou’s Place?',placeholder:'ej. Quería hablar con alguien sobre el apoyo disponible'},
      otherFacts:{label:'¿Hay algo más en lo que podamos ayudarle?',placeholder:'ej. Necesito un intérprete, o tengo una cita mañana'}
    }
  },
  ko:{
    formTitle:'환영 양식',org:'Lou’s Place',
    leadStrong:'천천히 하셔도 됩니다. 답하고 싶지 않은 질문은 비워 두셔도 괜찮습니다.',
    leadRest:'저희 팀원이 기꺼이 작성을 도와드립니다.',
    languageLabel:'언어를 선택하세요',
    sections:{about:'당신에 대해',now:'지금 어떤 일이 있나요',situation:'현재 상황',anything:'그 밖의 사항'},
    tick:'해당되는 항목을 모두 선택하세요.',
    children:{no:'아니요',yes:'예',ask:'몇 명인가요?'},
    other:{label:'조금 더 알려 주세요',placeholder:'예: 도움받고 싶은 다른 어려움'},
    actions:{submit:'양식 제출',busy:'요약을 준비하는 중…',cancel:'취소'},
    validation:{required:'필수',error:'이 질문에 답해 주세요.',errorTick:'최소 한 개를 선택해 주세요.',errorSummary:'표시된 질문에 답한 후 양식을 제출해 주세요.',toTop:'맨 위로'},
    options:['지낼 곳','안전','돈','건강, 또는 제 마음 상태','가족 또는 자녀','법률 도움','일 또는 학업','외로움','그 밖의 것'],
    fields:{
      fullName:{label:'이름',placeholder:'예: 김영희'},
      preferredName:{label:'어떻게 불러 드릴까요?',placeholder:'예: 영희, 김 선생님, 또는 원하시는 호칭'},
      age:{label:'나이',placeholder:'예: 34'},
      preferredLanguage:{label:'선호하는 언어',placeholder:'예: 한국어, 영어, 베트남어'},
      phoneOrContact:{label:'전화번호',subLabel:'선택 사항',helper:'연락해도 안전한 경우에만 적어 주세요.',placeholder:'예: 04XX XXX XXX'},
      childrenDependants:{label:'자녀가 있으신가요?'},
      currentAccommodation:{label:'지금 어디에서 지내고 계신가요?',placeholder:'예: 친구 집, 임시 거처, 쉼터, 임대 주택, 또는 현재 머물 곳이 없음'},
      stayDuration:{label:'그곳에서 얼마나 지낼 수 있나요?',helper:'대략이면 충분합니다.',placeholder:'예: 금요일까지, 약 2주, 또는 잘 모르겠음'},
      reasonToday:{label:'오늘 Lou’s Place에 오신 이유는 무엇인가요?',placeholder:'예: 어떤 도움을 받을 수 있는지 이야기하고 싶었습니다'},
      otherFacts:{label:'그 밖에 도와드릴 일이 있을까요?',placeholder:'예: 통역이 필요합니다, 또는 내일 예약이 있습니다'}
    }
  }
};

export const onlineText=code=>content[code]||content.en;

export const buildSections=code=>{
  const t=onlineText(code);
  const f=t.fields;
  const sections=[
    {number:'1',title:t.sections.about,fields:[
      {id:'fullName',required:true,...f.fullName},
      {id:'preferredName',...f.preferredName},
      {id:'age',type:'number',inputMode:'numeric',min:'0',required:true,...f.age},
      {id:'preferredLanguage',required:true,...f.preferredLanguage},
      {id:'phoneOrContact',type:'tel',...f.phoneOrContact},
      {id:'childrenDependants',type:'children',countId:'childrenCount',required:true,...t.children,...f.childrenDependants},
      {id:'currentAccommodation',type:'textarea',required:true,...f.currentAccommodation},
      {id:'stayDuration',required:true,...f.stayDuration}
    ]},
    {number:'2',title:t.sections.now,note:t.tick,fields:[
      {id:'problemCategories',ariaLabel:t.tick,type:'checkboxes',required:true,otherInputId:'problemCategoriesOther',otherLabel:t.other.label,otherPlaceholder:t.other.placeholder,
        options:categories.map((value,index)=>({value,label:t.options[index]}))}
    ]},
    {number:'3',title:t.sections.situation,fields:[{id:'reasonToday',type:'textarea',rows:5,required:true,...f.reasonToday}]},
    {number:'4',title:t.sections.anything,fields:[{id:'otherFacts',type:'textarea',rows:5,...f.otherFacts}]}
  ];
  return sections.map(section=>({...section,fields:section.fields.map(field=>field.required?{...field,requiredMark:t.validation.required}:field)}));
};

export const validateAnswers=(code,values)=>{
  const t=onlineText(code);
  const errors={};
  for(const section of buildSections(code))for(const field of section.fields){
    if(!field.required)continue;
    const value=values[field.id];
    if(field.type==='checkboxes'){if(!Array.isArray(value)||!value.length)errors[field.id]=t.validation.errorTick;continue;}
    if(field.type==='children'){if(value!=='No'&&!(value==='Yes'&&String(values[field.countId]||'').trim()))errors[field.id]=t.validation.error;continue;}
    if(!String(value??'').trim())errors[field.id]=t.validation.error;
  }
  return errors;
};
