import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmployeeAccessRoute from '@/components/EmployeeAccessRoute';
import AssignedCaseAccessRoute from '@/components/AssignedCaseAccessRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import IntakeFlow from '@/pages/IntakeFlow';
import IntakeSummary from '@/pages/IntakeSummary';
import CaseWorkspace from '@/pages/CaseWorkspace';
import ReferralNetwork from '@/pages/ReferralNetwork';
import CaseLists from '@/pages/CaseLists';
import SessionReview from '@/pages/SessionReview';
import FullReport from '@/pages/FullReport';
import '@/mvp.css';
import MVPShell from '@/components/mvp/MVPShell';
import SurveyModes from '@/pages/mvp/SurveyModes';
import SurveyExperience from '@/pages/mvp/SurveyExperience';
import SummaryAllocation from '@/pages/mvp/SummaryAllocation';
import CaseworkerWork from '@/pages/mvp/CaseworkerWork';
import ExternalDecision from '@/pages/mvp/ExternalDecision';
import ReferralMVP from '@/pages/mvp/ReferralMVP';
import FinalReportMVP from '@/pages/mvp/FinalReportMVP';
import CaseRecords from '@/pages/mvp/CaseRecords';
import PublicPortalShell from '@/components/portal/PublicPortalShell';
import PortalWelcome from '@/pages/portal/PortalWelcome';
import PortalSurveyModes from '@/pages/portal/PortalSurveyModes';
import PortalSurveyExperience from '@/pages/portal/PortalSurveyExperience';
import PortalMatching from '@/pages/portal/PortalMatching';
import PortalConfirmation from '@/pages/portal/PortalConfirmation';
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import EmployeeCaseWorkspace from '@/pages/employee/EmployeeCaseWorkspace';
import EmployeeDecision from '@/pages/employee/EmployeeDecision';
import EmployeeReferrals from '@/pages/employee/EmployeeReferrals';
import EmployeeFinalReport from '@/pages/employee/EmployeeFinalReport';
import EmployeeResolvedCases from '@/pages/employee/EmployeeResolvedCases';
import EmployeeResolvedCase from '@/pages/employee/EmployeeResolvedCase';
import RoleSelection from '@/pages/RoleSelection';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render public routes and protect the staff workspace separately.
  return (
    <Routes>
      <Route path="/employee/login" element={<Login />} />
      <Route path="/employee/register" element={<Register />} />
      <Route path="/employee/forgot-password" element={<ForgotPassword />} />
      <Route path="/employee/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<RoleSelection />} />
      <Route element={<PublicPortalShell />}>
        <Route path="/user" element={<PortalWelcome />} />
        <Route path="/user/survey" element={<PortalSurveyModes />} />
        <Route path="/user/survey/:mode" element={<PortalSurveyExperience />} />
        <Route path="/user/matching" element={<PortalMatching />} />
        <Route path="/user/confirmation" element={<PortalConfirmation />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<EmployeeLoginRedirect />} />}>
        <Route element={<EmployeeAccessRoute/>}>
          <Route element={<MVPShell />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/resolved" element={<EmployeeResolvedCases />} />
            <Route path="/employee/resolved/:reportId" element={<EmployeeResolvedCase />} />
            <Route path="/employee/cases/:caseId" element={<AssignedCaseAccessRoute/>}>
              <Route index element={<EmployeeCaseWorkspace />} />
              <Route path="decision" element={<EmployeeDecision />} />
              <Route path="referrals" element={<EmployeeReferrals />} />
              <Route path="final" element={<EmployeeFinalReport />} />
            </Route>
            <Route path="/employee/survey" element={<SurveyModes />} />
            <Route path="/employee/survey/:mode" element={<SurveyExperience />} />
            <Route path="/employee/summary" element={<SummaryAllocation />} />
            <Route path="/employee/casework" element={<CaseworkerWork />} />
            <Route path="/employee/casework/:recordId" element={<CaseworkerWork />} />
            <Route path="/employee/external-help" element={<ExternalDecision />} />
            <Route path="/employee/referrals" element={<ReferralMVP />} />
            <Route path="/employee/final-report" element={<FinalReportMVP />} />
            <Route path="/employee/database" element={<CaseRecords />} />
          </Route>
        </Route>
      </Route>
      <Route path="/portal/*" element={<LegacyPrefixRedirect from="/portal" to="/user" />} />
      <Route path="/staff/*" element={<LegacyPrefixRedirect from="/staff" to="/employee" />} />
      <Route path="/login" element={<LegacyRedirect to="/employee/login" />} />
      <Route path="/register" element={<LegacyRedirect to="/employee/register" />} />
      <Route path="/forgot-password" element={<LegacyRedirect to="/employee/forgot-password" />} />
      <Route path="/reset-password" element={<LegacyRedirect to="/employee/reset-password" />} />
      <Route path="/survey/*" element={<LegacyPrefixRedirect from="/survey" to="/employee/survey" />} />
      <Route path="/summary" element={<LegacyRedirect to="/employee/summary" />} />
      <Route path="/casework/*" element={<LegacyPrefixRedirect from="/casework" to="/employee/casework" />} />
      <Route path="/external-help" element={<LegacyRedirect to="/employee/external-help" />} />
      <Route path="/referral-mvp" element={<LegacyRedirect to="/employee/referrals" />} />
      <Route path="/final-report" element={<LegacyRedirect to="/employee/final-report" />} />
      <Route path="/database" element={<LegacyRedirect to="/employee/database" />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function EmployeeLoginRedirect() {
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/employee/login?returnTo=${returnTo}`} replace />;
}

function LegacyRedirect({to}) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}${location.hash}`} replace />;
}

function LegacyPrefixRedirect({from,to}) {
  const location = useLocation();
  const path = location.pathname.replace(from, to);
  return <Navigate to={`${path}${location.search}${location.hash}`} replace />;
}


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
