import React from 'react';
import {ArrowLeft} from 'lucide-react';
import {Link} from 'react-router-dom';

export default function ReturnButton(){return <Link to="/" aria-label="Go back to the home page" className="portal-back"><ArrowLeft size={25} aria-hidden="true"/><span>Go Back</span></Link>}