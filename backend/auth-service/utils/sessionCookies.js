const config = require('config');

// Cross-subdomain session cookies for the unityfitness.ma platform.
//
//   uf_token  — the JWT, HttpOnly (JS can't read it). Enables a true
//               single-sign-on handoff between app.unityfitness.ma and any
//               other subdomain.
//   uf_authed — a non-sensitive "1" presence flag, readable by JS. The
//               landing page (unityfitness.ma) reads this to switch its
//               header button from "Connexion" to "Aller au Dashboard".
//
// In production set COOKIE_DOMAIN=.unityfitness.ma so both cookies are shared
// across every subdomain. On localhost leave it unset: the cookies become
// host-only on `localhost`, which (because cookies ignore port) are still
// shared between the dashboard (:3000) and the landing page (:5173).

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000; // matches the JWT's expiresIn: '2d'

const TOKEN_COOKIE = 'uf_token';
const AUTHED_COOKIE = 'uf_authed';

function cookieDomain() {
  const domain = config.has('cookieDomain') ? config.get('cookieDomain') : '';
  return domain || undefined; // undefined → host-only cookie (dev)
}

function baseOptions() {
  const opts = {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
  const domain = cookieDomain();
  if (domain) opts.domain = domain;
  return opts;
}

function setSessionCookies(res, token) {
  const base = baseOptions();
  res.cookie(TOKEN_COOKIE, token, { ...base, httpOnly: true, maxAge: TWO_DAYS_MS });
  res.cookie(AUTHED_COOKIE, '1', { ...base, httpOnly: false, maxAge: TWO_DAYS_MS });
}

function clearSessionCookies(res) {
  // clearCookie must match path/domain/sameSite/secure; maxAge is irrelevant.
  const base = baseOptions();
  res.clearCookie(TOKEN_COOKIE, { ...base, httpOnly: true });
  res.clearCookie(AUTHED_COOKIE, { ...base, httpOnly: false });
}

module.exports = { setSessionCookies, clearSessionCookies, TOKEN_COOKIE, AUTHED_COOKIE };
