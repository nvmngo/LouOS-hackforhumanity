import React from "react";
import ReturnButton from "@/components/portal/ReturnButton";
import "@/auth.css";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <main className="auth-page">
      <ReturnButton variant="auth" to="/" label="Return to portal selection" />
      <section className="auth-panel">
        <span className="auth-mark">Lou<span>OS</span></span>
        <h1>{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        <div className="auth-body">{children}</div>
        {footer && <p className="auth-footer">{footer}</p>}
      </section>
    </main>
  );
}
