import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,BriefcaseBusiness,UserRound} from 'lucide-react';
import './role-selection.css';

const options=[
  {to:'/portal',label:'Client',detail:'Get support',Icon:UserRound},
  {to:'/login?returnTo=%2Fstaff',label:'Employee',detail:'Staff login',Icon:BriefcaseBusiness}
];

export default function RoleSelection(){return <main className="role-select"><section><span className="role-select__logo">Lou<span>OS</span></span><p>Welcome to Lou’s Place</p><h1>How are you joining?</h1><div className="role-select__grid">{options.map(({to,label,detail,Icon})=><Link to={to} key={label}><span className="role-select__icon"><Icon/></span><div><h2>{label}</h2><p>{detail}</p></div><ArrowRight className="role-select__arrow"/></Link>)}</div></section></main>}