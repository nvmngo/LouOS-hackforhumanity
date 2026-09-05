import React from 'react';
export default function OnlineReportField({field,value,values,onChange}){
  const options=field.options||[];
  if(field.type==='conditionalCount'){
    const answer=values?.[field.yesId];
    const isYes=answer==='Yes';
    const chooseYes=()=>onChange(field.yesId,isYes?'':'Yes');
    const chooseNo=()=>{onChange(field.yesId,answer==='No'?'':'No');onChange(field.id,'');};
    return <fieldset className="online-field online-children"><legend>{field.label}</legend><div><label><input type="checkbox" checked={answer==='No'} onChange={chooseNo}/><span>No</span></label><div className="online-children-yes"><label><input type="checkbox" checked={isYes} onChange={chooseYes}/><span>If yes, how many?</span></label><input aria-label="Number of children" type="number" min="0" inputMode="numeric" disabled={!isYes} value={value||''} onChange={e=>onChange(field.id,e.target.value)}/></div></div></fieldset>;
  }
  if(field.type==='textarea')return <label className="online-field"><span>{field.label}</span><textarea value={value||''} onChange={e=>onChange(field.id,e.target.value)} rows="3"/></label>;
  if(field.type==='radio')return <fieldset className="online-field"><legend>{field.label}</legend><div className="online-options">{options.map(option=><label key={option}><input type="radio" name={field.id} checked={value===option} onChange={()=>onChange(field.id,option)}/><span>{option}</span></label>)}</div></fieldset>;
  if(field.type==='checkboxes')return <fieldset className="online-field online-wide"><legend>{field.label}</legend><div className="online-checks">{options.map(option=><label key={option}><input type="checkbox" checked={(value||[]).includes(option)} onChange={()=>onChange(field.id,(value||[]).includes(option)?value.filter(item=>item!==option):[...(value||[]),option])}/><span>{option}</span></label>)}</div></fieldset>;
  return <label className="online-field"><span>{field.label}</span><input type={field.type||'text'} value={value||''} onChange={e=>onChange(field.id,e.target.value)}/></label>;
}