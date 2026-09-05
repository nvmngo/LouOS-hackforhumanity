import React from 'react';
import { ChevronRight } from 'lucide-react';
export const Badge=({children,tone='sage'})=><span className={`badge ${tone}`}>{children}</span>;
export const Stat=({label,value,tone})=><div className={`stat-card ${tone||''}`}><span>{label}</span><strong>{value}</strong></div>;
export const Section=({title,children,className=''})=><section className={`panel ${className}`}><div className="panel-title">{title}</div>{children}</section>;
export const Arrow=()=> <ChevronRight size={18}/>;
export const Person=({name,role,detail,recommended})=><div className={`person ${recommended?'recommended':''}`}><div className="avatar">{name.split(' ').map(x=>x[0]).join('')}</div><div><strong>{name}</strong><span>{role}</span><small>{detail}</small></div>{recommended&&<Badge>Best match</Badge>}</div>;