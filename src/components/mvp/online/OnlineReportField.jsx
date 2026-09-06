import React from 'react';

const optionValue=option=>typeof option==='string'?option:option.value;
const optionLabel=option=>typeof option==='string'?option:option.label;

export default function OnlineReportField({field,value,values,error,onChange}){
  const options=field.options||[];
  const helperId=field.helper?`${field.id}-helper`:undefined;
  const errorId=error?`${field.id}-error`:undefined;
  const describedBy=[helperId,errorId].filter(Boolean).join(' ')||undefined;
  const mark=field.required&&field.requiredMark?<em className="online-required">{field.requiredMark}</em>:null;
  const fieldLabel=<>{field.label}{mark}{field.subLabel&&<small>{field.subLabel}</small>}</>;
  const message=error?<p className="online-field-error" id={errorId} role="alert">{error}</p>:null;
  const wrapper={className:'online-field',...(error?{'data-error':'true'}:{})};

  if(field.type==='textarea')return <label {...wrapper}><span>{fieldLabel}</span>{field.helper&&<small className="online-helper" id={helperId}>{field.helper}</small>}{message}<textarea value={value||''} onChange={e=>onChange(field.id,e.target.value)} rows={field.rows||3} placeholder={field.placeholder} aria-describedby={describedBy} aria-invalid={error?true:undefined}/></label>;

  if(field.type==='radio')return <fieldset {...wrapper} aria-describedby={describedBy}><legend>{fieldLabel}</legend>{field.helper&&<p className="online-helper" id={helperId}>{field.helper}</p>}{message}<div className="online-options">{options.map(option=><label key={optionValue(option)}><input type="radio" name={field.id} checked={value===optionValue(option)} onChange={()=>onChange(field.id,optionValue(option))}/><span>{optionLabel(option)}</span></label>)}</div></fieldset>;

  if(field.type==='children')return <fieldset {...wrapper} className={`${wrapper.className} online-children`}><legend>{fieldLabel}</legend>{message}<div>{options.map(option=><label key={optionValue(option)}><input type="radio" name={field.id} checked={value===optionValue(option)} onChange={()=>{onChange(field.id,optionValue(option));if(optionValue(option)==='No')onChange(field.countId,'');}}/><span>{optionLabel(option)}</span></label>)}<label className="online-children-yes"><span>— {field.countLabel}</span><input type="number" inputMode="numeric" min="0" aria-label={field.countLabel} value={values?.[field.countId]||''} disabled={value!=='Yes'} onChange={e=>onChange(field.countId,e.target.value)}/></label></div></fieldset>;

  if(field.type==='checkboxes'){
    const selected=value||[];
    const otherOption=field.otherOption||'Other';
    const showOther=field.otherInputId&&selected.includes(otherOption);
    const toggle=option=>{const removing=selected.includes(option);onChange(field.id,removing?selected.filter(item=>item!==option):[...selected,option]);if(removing&&option===otherOption&&field.otherInputId)onChange(field.otherInputId,'');};
    return <fieldset {...wrapper} aria-label={field.label?undefined:field.ariaLabel}>{field.label?<legend>{fieldLabel}</legend>:mark&&<p className="online-required-line">{mark}</p>}{message}<div className="online-checks">{options.map(option=><label key={optionValue(option)}><input type="checkbox" checked={selected.includes(optionValue(option))} onChange={()=>toggle(optionValue(option))}/><span>{optionLabel(option)}</span></label>)}</div>{showOther&&<label className="online-other-detail"><span>{field.otherLabel}</span><input type="text" placeholder={field.otherPlaceholder} value={values?.[field.otherInputId]||''} onChange={e=>onChange(field.otherInputId,e.target.value)} autoFocus/></label>}</fieldset>;
  }

  return <label {...wrapper}><span>{fieldLabel}</span>{field.helper&&<small className="online-helper" id={helperId}>{field.helper}</small>}{message}<input type={field.type||'text'} inputMode={field.inputMode} min={field.min} placeholder={field.placeholder} value={value||''} onChange={e=>onChange(field.id,e.target.value)} aria-describedby={describedBy} aria-invalid={error?true:undefined}/></label>;
}
