import React from 'react';
import {ArrowRight} from 'lucide-react';
import {Link} from 'react-router-dom';

export default function PortalWelcome(){return <main className="mvp-main mvp-hero"><section><p className="mvp-kicker">Welcome to Lou’s Place</p><h1>Tell us how we can support you.</h1><p className="mvp-lead">Complete a short, private intake form. Once submitted, we’ll match you with a suitable specialist from our team.</p><Link className="mvp-btn" to="/portal/survey">Start your survey <ArrowRight size={18}/></Link></section><aside className="mvp-art"><blockquote>“Support starts with being heard.”<small>Lou’s Place client portal</small></blockquote></aside></main>}