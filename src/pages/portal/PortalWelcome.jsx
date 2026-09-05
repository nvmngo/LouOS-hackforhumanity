import React from 'react';
import {ArrowRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import './portal-welcome.css';

export default function PortalWelcome(){return <main className="portal-welcome"><section className="portal-welcome__hero"><p className="portal-welcome__kicker">Welcome to Lou’s Place</p><h1><span>Tell us how</span><span>we can support</span><span>you.</span></h1><Link className="portal-welcome__action" to="/portal/survey">Get Started <ArrowRight size={24}/></Link></section><aside className="portal-welcome__quote"><blockquote>“Support starts with being heard.”<small>Lou’s Place client portal</small></blockquote></aside></main>}