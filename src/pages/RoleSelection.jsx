import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,BriefcaseBusiness,UserRound} from 'lucide-react';
import './role-selection.css';

const options=[
  {to:'/user',label:'User',detail:'Get support',Icon:UserRound},
  {to:'/employee',label:'Employee',detail:'Employee portal',Icon:BriefcaseBusiness}
];

export default function RoleSelection(){return <main className="role-select"><header><span className="role-select__logo">Lou<span>OS</span></span><small>Lou’s Place</small></header><section><p>Welcome</p><h1>How are you joining?</h1><div className="role-select__grid">{options.map(({to,label,detail,Icon})=><Link to={to} key={label}><span className="role-select__icon"><Icon/></span><div><h2>{label}</h2><p>{detail}</p></div><ArrowRight className="role-select__arrow"/></Link>)}</div></section></main>}
