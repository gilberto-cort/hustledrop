import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Landing from '@/pages/Landing';
import Discover from '@/pages/Discover';
import Results from '@/pages/Results';
import Dashboard from '@/pages/Dashboard';
import Build from '@/pages/Build';
import Launch from '@/pages/Launch';
import Grow from '@/pages/Grow';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';
import RouteErrorBoundary from '@/components/RouteErrorBoundary';
import UnauthenticatedRedirect from '@/components/UnauthenticatedRedirect';
import AdminRoute from '@/components/AdminRoute';
import AppLayout from '@/components/AppLayout';
import AdminLayout from '@/components/AdminLayout';
import AdminMatches from '@/pages/admin/AdminMatches';
import MatchTester from '@/pages/admin/MatchTester';
import DnaTester from '@/pages/admin/DnaTester';
import Avatars from '@/pages/admin/Avatars';
import BuilderTester from '@/pages/admin/BuilderTester';
import HustleDNA from '@/pages/HustleDNA';

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
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="/discover" element={<Discover />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<UnauthenticatedRedirect />} />}>
        <Route element={<AppLayout />}>
          <Route path="/results" element={<Results />} />
          <Route path="/hustledna" element={<HustleDNA />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/build" element={<RouteErrorBoundary><Build /></RouteErrorBoundary>} />
          <Route path="/launch" element={<Launch />} />
          <Route path="/grow" element={<Grow />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<UnauthenticatedRedirect />} />}>
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/matches" element={<AdminMatches />} />
            <Route path="/admin/match-tester" element={<MatchTester />} />
            <Route path="/admin/dna-tester" element={<DnaTester />} />
            <Route path="/admin/avatars" element={<Avatars />} />
            <Route path="/admin/builder-tester" element={<BuilderTester />} />
          </Route>
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