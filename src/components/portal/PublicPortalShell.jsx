import React from 'react';
import {Outlet,useLocation} from 'react-router-dom';
import './portal-flow.css';

export default function PublicPortalShell(){const{pathname}=useLocation();return <div className={`mvp portal-shell ${pathname==='/user'?'portal-home':'portal-flow-shell'}`}><Outlet/></div>}