import React from 'react';
import {ArrowLeft} from 'lucide-react';
import {Link} from 'react-router-dom';

const variantClass={portal:'portal-back',inline:'page-back',auth:'auth-back'};

export default function ReturnButton({to='/user',label='Return to the user portal',text='Back',variant='portal'}){return <Link to={to} aria-label={label} title={label} className={variantClass[variant]||variantClass.portal}><ArrowLeft size={28} aria-hidden="true"/><span>{text}</span></Link>}
