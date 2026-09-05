import React from 'react';
import {ArrowLeft} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

export default function ReturnButton(){const navigate=useNavigate();return <button type="button" onClick={()=>navigate(-1)} aria-label="Return to the previous step" className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 font-semibold text-foreground"><ArrowLeft size={18} aria-hidden="true"/>Previous step</button>}