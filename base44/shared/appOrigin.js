// Canonical app origin for Stripe checkout redirect URLs (success/cancel).
//
// Derived from the incoming request — the caller is browsing the app itself,
// whether that's the current base44.app deployment URL or a connected custom
// domain — so checkout keeps working when the app URL changes or a custom
// domain is connected. No hard-coded hostnames anywhere: if the origin cannot
// be derived, callers must fail loudly (checkout_error) instead of ever
// redirecting the user to a dead app.
export function getAppOrigin(req) {
  try {
    const url = new URL(req.url);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url.origin;
    }
  } catch (e) {
    // fall through — caller decides how to fail
  }
  return null;
}