import React from 'react';
import {ArrowLeft} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

export default function ReturnButton(){const navigate=useNavigate();return <button type="button" onClick={()=>navigate(-1)} aria-label="Return to the previous step" title="Previous step" className="portal-back mb-6 grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground"><ArrowLeft size={20} aria-hidden="true"/></button>}