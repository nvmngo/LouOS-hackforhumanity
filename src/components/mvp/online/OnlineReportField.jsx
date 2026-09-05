import React from 'react';
export default function OnlineReportField({field,value,onChange}){
  const options=field.options||[];
  if(field.type==='textarea')return <label className="online-field"><span>{field.label}</span><textarea value={value||''} onChange={e=>onChange(field.id,e.target.value)} rows="3"/></label>;
  if(field.type==='radio')return <fieldset className="online-field"><legend>{field.label}</legend><div className="online-options">{options.map(option=><label key={option}><input type="radio" name={field.id} checked={value===option} onChange={()=>onChange(field.id,option)}/><span>{option}</span></label>)}</div></fieldset>;
  if(field.type==='checkboxes')return <fieldset className="online-field online-wide"><legend>{field.label}</legend><div className="online-checks">{options.map(option=><label key={option}><input type="checkbox" checked={(value||[]).includes(option)} onChange={()=>onChange(field.id,(value||[]).includes(option)?value.filter(item=>item!==option):[...(value||[]),option])}/><span>{option}</span></label>)}</div></fieldset>;
  return <label className="online-field"><span>{field.label}</span><input type={field.type||'text'} value={value||''} onChange={e=>onChange(field.id,e.target.value)}/></label>;
}