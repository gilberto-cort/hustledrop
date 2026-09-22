// Canonical app origin for Stripe checkout redirect URLs (success/cancel).
//
// The origin must be the one the USER is browsing — the current base44.app
// deployment URL or a connected custom domain — so checkout keeps working
// when the app URL changes or a domain is connected. No hard-coded hostnames
// anywhere: if the origin cannot be determined, callers must fail loudly
// (checkout_error) instead of ever redirecting the user to a dead or internal
// host.
export function getAppOrigin(req) {
  const headers = (req && req.headers) || {};

  // 1. Browser Origin header — present on the SDK's POST from the app, and it
  //    is exactly the origin the user is browsing (deployment URL or custom
  //    domain). This is the primary source.
  const origin = headers.get && headers.get('origin');
  if (origin) {
    try {
      const u = new URL(origin);
      if (u.protocol === 'https:') return u.origin;
    } catch (e) {
      // fall through
    }
  }

  // 2. Referer header — same origin as the browsing context.
  const referer = headers.get && headers.get('referer');
  if (referer) {
    try {
      const u = new URL(referer);
      if (u.protocol === 'https:') return u.origin;
    } catch (e) {
      // fall through
    }
  }

  // 3. Proxy-forwarded host, when the platform routes with standard headers.
  const fwdHost = headers.get && headers.get('x-forwarded-host');
  const fwdProto = (headers.get && headers.get('x-forwarded-proto')) || 'https';
  if (fwdHost) return `${fwdProto}://${fwdHost}`;

  // 4. Request URL — last resort only. Inside the runtime this can resolve to
  //    the platform's internal dispatcher host (a *.workers.dev URL the user
  //    never browses), so internal hosts are rejected. Fail loudly otherwise.
  try {
    const u = new URL(req.url);
    if (
      (u.protocol === 'https:' || u.protocol === 'http:') &&
      !u.hostname.endsWith('.workers.dev')
    ) {
      return u.origin;
    }
  } catch (e) {
    // fall through
  }
  return null;
}