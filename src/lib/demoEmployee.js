export const DEMO_EMPLOYEE={
  email:'maya.chen@example.org',
  password:'LouOS-demo-2026',
  fullName:'Maya Chen',
  role:'Senior Caseworker'
};

const sessionKey='louos-demo-employee';
export const isDemoEmployee=()=>sessionStorage.getItem(sessionKey)==='active';
export const startDemoEmployeeSession=()=>sessionStorage.setItem(sessionKey,'active');