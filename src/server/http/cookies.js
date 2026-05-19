const { getEnv } = require("../config/env");

function isProd() {
  return process.env.NODE_ENV === "production";
}

function resolveCookieName() {
  const env = getEnv();
  if (isProd() && !env.cookieName.startsWith("__Host-")) {
    return `__Host-${env.cookieName}`;
  }
  return env.cookieName;
}

function authCookieOptions() {
  const env = getEnv();
  return {
    name: resolveCookieName(),
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: env.cookieMaxAgeSeconds
  };
}

function setAuthCookie(response, token) {
  const options = authCookieOptions();
  response.cookies.set({ ...options, value: token });
  return response;
}

function clearAuthCookie(response) {
  response.cookies.set({
    name: resolveCookieName(),
    value: "",
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}

function readAuthCookie(request) {
  return request.cookies?.get?.(resolveCookieName())?.value || null;
}

module.exports = {
  authCookieOptions,
  clearAuthCookie,
  readAuthCookie,
  resolveCookieName,
  setAuthCookie
};
