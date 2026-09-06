import React from 'react';

export default function OnlineReportField({field,value,values,onChange}){
  const options=field.options||[];
  const fieldClass=`online-field${field.wide?' online-wide':''}`;
  const helperId=field.helper?`${field.id}-helper`:undefined;
  const fieldLabel=<>{field.label}{field.subLabel&&<small>{field.subLabel}</small>}</>;

  if(field.type==='textarea')return <label className={fieldClass}><span>{fieldLabel}</span>{field.helper&&<small className="online-helper" id={helperId}>{field.helper}</small>}<textarea value={value||''} onChange={e=>onChange(field.id,e.target.value)} rows={field.rows||3} placeholder={field.placeholder} aria-describedby={helperId}/></label>;

  if(field.type==='radio')return <fieldset className={fieldClass} aria-describedby={helperId}><legend>{fieldLabel}</legend>{field.helper&&<p className="online-helper" id={helperId}>{field.helper}</p>}<div className="online-options">{options.map(option=><label key={option}><input type="radio" name={field.id} checked={value===option} onChange={()=>onChange(field.id,option)}/><span><b>{option}</b>{field.optionGuidance?.[option]&&<small>{field.optionGuidance[option]}</small>}</span></label>)}</div></fieldset>;

  if(field.type==='checkboxes'){
    const selected=value||[];
    const showOther=field.otherInputId&&selected.includes('Other');
    const toggle=option=>{const removing=selected.includes(option);onChange(field.id,removing?selected.filter(item=>item!==option):[...selected,option]);if(removing&&option==='Other'&&field.otherInputId)onChange(field.otherInputId,'');};
    return <fieldset className="online-field online-wide"><legend>{field.label}</legend><div className="online-checks">{options.map(option=><label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={()=>toggle(option)}/><span>{option}</span></label>)}</div>{showOther&&<label className="online-other-detail"><span>Please tell us more</span><input type="text" placeholder="e.g. Another concern you would like support with" value={values?.[field.otherInputId]||''} onChange={e=>onChange(field.otherInputId,e.target.value)} autoFocus/></label>}</fieldset>;
  }

  return <label className={fieldClass}><span>{fieldLabel}</span>{field.helper&&<small className="online-helper" id={helperId}>{field.helper}</small>}<input type={field.type||'text'} inputMode={field.inputMode} min={field.min} placeholder={field.placeholder} value={value||''} onChange={e=>onChange(field.id,e.target.value)} aria-describedby={helperId}/></label>;
}
