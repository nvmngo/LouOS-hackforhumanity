import {Outlet} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import useEmployeeCase from '@/hooks/useEmployeeCase';

export default function AssignedCaseAccessRoute(){
  const{caseId}=useParams();
  const{loading,error}=useEmployeeCase(caseId);
  if(loading)return <main className="mvp-main"><div className="employee-empty">Loading…</div></main>;
  if(error)return <main className="mvp-main"><div className="employee-empty">{error}</div></main>;
  return <Outlet/>;
}
