import React from 'react';
export default function StatusTag({children,tone=''}){return <span className={`lr-state ${tone}`}>{children}</span>}