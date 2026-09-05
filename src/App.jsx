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
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<StaffShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/intake-summary" element={<IntakeSummary />} />
          <Route path="/case" element={<CaseWorkspace />} />
          <Route path="/network" element={<ReferralNetwork />} />
          <Route path="/cases" element={<CaseLists />} />
          <Route path="/referrals" element={<CaseLists />} />
          <Route path="/session-review" element={<SessionReview />} />
          <Route path="/report" element={<FullReport />} />
          <Route path="/settings" element={<Dashboard />} />
        </Route>
        <Route element={<ClientShell />}>
          <Route path="/intake" element={<IntakeFlow />} />
          <Route path="/intake/language" element={<IntakeFlow />} />
          <Route path="/intake/conversation" element={<IntakeFlow />} />
          <Route path="/intake/guided" element={<IntakeFlow />} />
          <Route path="/intake/paper" element={<IntakeFlow />} />
          <Route path="/intake/processing" element={<IntakeFlow />} />
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