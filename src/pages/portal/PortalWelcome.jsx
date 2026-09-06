import React from 'react';
import {ArrowRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import PortalContactFooter from '@/components/portal/PortalContactFooter';
import ReturnButton from '@/components/portal/ReturnButton';
import './portal-welcome.css';

export default function PortalWelcome(){return <main className="portal-welcome"><ReturnButton to="/" label="Return to portal selection"/><section className="portal-welcome__hero"><div className="portal-welcome__brand"><span className="portal-welcome__mark">Lou<span>OS</span></span><span className="portal-welcome__badge">User portal</span></div><p className="portal-welcome__kicker">Welcome to Lou’s Place</p><h1><span>Tell us how</span><span>we can support</span><span>you.</span></h1><Link className="portal-welcome__action" to="/user/survey">Get Started <ArrowRight size={24}/></Link></section><PortalContactFooter/></main>}
