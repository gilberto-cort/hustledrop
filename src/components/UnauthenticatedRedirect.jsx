import { Navigate, useLocation } from 'react-router-dom';

// Sends an unauthenticated visitor to login with a safe returnTo deep link,
// so flows that require an account (e.g. an anonymous quiz reaching
// /results) resume exactly where they left off after sign-in.
// Login validates the param via safeReturnTo() — only same-origin,
// single-slash paths are honored.
export default function UnauthenticatedRedirect() {
  const location = useLocation();
  const target = `${location.pathname}${location.search}`;
  return <Navigate to={`/login?returnTo=${encodeURIComponent(target)}`} replace />;
}