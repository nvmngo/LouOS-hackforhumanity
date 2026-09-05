import React from 'react';
import {ArrowLeft} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

export default function ReturnButton(){const navigate=useNavigate();return <button type="button" onClick={()=>navigate(-1)} aria-label="Go back to the previous page" className="portal-back"><ArrowLeft size={22} aria-hidden="true"/><span>Go Back</span></button>}