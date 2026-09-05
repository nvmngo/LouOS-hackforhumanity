import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LogOut, HeartHandshake } from 'lucide-react';
export default function ClientShell(){return <div className="client-shell"><header><Link to="/" className="client-brand"><span>Lou</span>OS</Link><div><button className="staff-help"><HeartHandshake size={18}/>Need a staff member?</button><Link className="quick-exit" to="/"><LogOut size={17}/>Quick Exit</Link></div></header><main><Outlet/></main><footer>You can stop at any time and speak with a Lou’s Place team member.</footer></div>}