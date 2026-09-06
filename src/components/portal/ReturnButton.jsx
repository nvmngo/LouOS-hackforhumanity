import React from 'react';
import {ArrowLeft} from 'lucide-react';
import {Link} from 'react-router-dom';

export default function ReturnButton({to='/portal',label='Return to the client portal',text='Back',variant='portal'}){return <Link to={to} aria-label={label} title={label} className={variant==='inline'?'page-back':'portal-back'}><ArrowLeft size={28} aria-hidden="true"/><span>{text}</span></Link>}
