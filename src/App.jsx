import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import StaffShell from '@/components/louos/StaffShell';
import ClientShell from '@/components/louos/ClientShell';
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
import Welcome from '@/pages/mvp/Welcome';
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
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<PublicPortalShell />}>
        <Route path="/" element={<PortalWelcome />} />
        <Route path="/portal/survey" element={<PortalSurveyModes />} />
        <Route path="/portal/survey/:mode" element={<PortalSurveyExperience />} />
        <Route path="/portal/matching" element={<PortalMatching />} />
        <Route path="/portal/confirmed" element={<PortalConfirmation />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<MVPShell />}>
          <Route path="/staff" element={<EmployeeDashboard />} />
          <Route path="/staff/cases/:caseId" element={<EmployeeCaseWorkspace />} />
          <Route path="/staff/cases/:caseId/decision" element={<EmployeeDecision />} />
          <Route path="/staff/cases/:caseId/referrals" element={<EmployeeReferrals />} />
          <Route path="/staff/cases/:caseId/final" element={<EmployeeFinalReport />} />
          <Route path="/survey" element={<SurveyModes />} />
          <Route path="/survey/:mode" element={<SurveyExperience />} />
          <Route path="/summary" element={<SummaryAllocation />} />
          <Route path="/casework" element={<CaseworkerWork />} />
          <Route path="/casework/:recordId" element={<CaseworkerWork />} />
          <Route path="/external-help" element={<ExternalDecision />} />
          <Route path="/referral-mvp" element={<ReferralMVP />} />
          <Route path="/final-report" element={<FinalReportMVP />} />
          <Route path="/database" element={<CaseRecords />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


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