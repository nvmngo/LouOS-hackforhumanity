import {base44} from '@/api/base44Client';

const key='louos-prototype-employee-session';

export const readEmployeeSession=()=>{
  try{
    const value=JSON.parse(sessionStorage.getItem(key)||'null');
    return value?.employeeToken&&value?.employee?value:null;
  }catch{return null;}
};

export const saveEmployeeSession=value=>sessionStorage.setItem(key,JSON.stringify(value));
export const clearEmployeeSession=()=>sessionStorage.removeItem(key);
export const employeeToken=()=>readEmployeeSession()?.employeeToken||'';
export const isPrototypeEmployee=()=>Boolean(employeeToken());
export const employeePortal=async(action,payload={})=>base44.functions.invoke('employeePortal',{action,employeeToken:employeeToken(),...payload});
export const currentEmployee=async()=>readEmployeeSession()?.employee||await base44.auth.me();
