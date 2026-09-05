import React,{useState} from 'react';
import {Sparkles,Check} from 'lucide-react';

export default function RecordNoteAssistant({onApprove}){
  const[notes,setNotes]=useState(''),[suggestion,setSuggestion]=useState(''),[decided,setDecided]=useState(false);
  const analyse=()=>{setSuggestion(notes.trim());setDecided(false)};
  const approve=()=>{onApprove({id:crypto.randomUUID(),area:'Case Notes',text:suggestion});setDecided(true)};
  return <aside className="sr-assistant"><div className="sr-ai-title"><Sparkles/><div><h2>LouOS Note Assistant</h2><p>Type short facts during the interview. Nothing changes until you approve it.</p></div></div><label>Interview notes</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add new information from the interview…"/><button className="sr-primary" disabled={!notes.trim()} onClick={analyse}><Sparkles size={15}/>Analyse Notes</button>{suggestion&&!decided&&<article className="sr-suggestion"><header><b>Case Notes</b><span className="sr-badge high">Add</span></header><textarea value={suggestion} onChange={e=>setSuggestion(e.target.value)}/><div className="sr-actions"><button onClick={approve}>Approve</button><button onClick={()=>setSuggestion('')}>Reject</button></div></article>}{decided&&<div className="sr-result"><Check size={14}/>Approved note added to this report</div>}</aside>
}