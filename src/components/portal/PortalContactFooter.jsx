import React from 'react';
import {Facebook,Heart,Instagram,Linkedin,Mail,MapPin,Phone} from 'lucide-react';

export default function PortalContactFooter(){return <footer className="portal-contact">
  <div className="portal-contact__inner">
    <div className="portal-contact__main">
      <h2>Contact us</h2>
      <address>
        <a href="tel:0293584553"><Phone aria-hidden="true"/>02 9358 4553</a>
        <a href="mailto:info@lousplace.com.au"><Mail aria-hidden="true"/>info@lousplace.com.au</a>
        <p><MapPin aria-hidden="true"/><span>67 Renwick St, Redfern NSW 2016</span></p>
      </address>
    </div>
    <div className="portal-contact__side">
      <div className="portal-contact__actions">
        <a href="tel:0293584553">Get Help <span aria-hidden="true">!</span></a>
        <a href="mailto:info@lousplace.com.au?subject=Donation%20enquiry">Donate <Heart aria-hidden="true"/></a>
      </div>
      <div className="portal-contact__social" aria-label="Lou’s Place social media">
        <span title="Facebook"><Facebook aria-hidden="true"/></span>
        <span title="Instagram"><Instagram aria-hidden="true"/></span>
        <span title="LinkedIn"><Linkedin aria-hidden="true"/></span>
      </div>
    </div>
  </div>
  <p className="portal-contact__bar">Lou’s Place · A safe place to begin</p>
</footer>}
