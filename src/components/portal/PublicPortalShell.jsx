import React from 'react';
import {Link,Outlet} from 'react-router-dom';

export default function PublicPortalShell(){return <div className="mvp"><header className="mvp-top"><Link className="mvp-logo" to="/">Lou<span>OS</span></Link><span className="mvp-step">Client portal</span></header><Outlet/></div>}