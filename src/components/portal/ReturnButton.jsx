import React from 'react';
import {ChevronLeft} from 'lucide-react';
import {Link} from 'react-router-dom';

export default function ReturnButton({to='/user',label='Return to the user portal'}){return <Link to={to} aria-label={label} title={label} className="portal-back"><ChevronLeft size={28} aria-hidden="true"/></Link>}
