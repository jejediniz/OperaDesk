const { authenticate, getTokenFromRequest, requireAdmin, requireTiOuAdmin } = require("./auth");
const { authCookieOptions, clearAuthCookie, readAuthCookie, setAuthCookie } = require("./cookies");
const {
  created,
  generateRequestId,
  handleError,
  json,
  noContent,
  run,
  success
} = require("./response");
const { getClientIp, queryObject, readBody, routeParams, validate } = require("./request");

module.exports = {
  authCookieOptions,
  authenticate,
  clearAuthCookie,
  created,
  generateRequestId,
  getClientIp,
  getTokenFromRequest,
  handleError,
  json,
  noContent,
  queryObject,
  readAuthCookie,
  readBody,
  requireAdmin,
  requireTiOuAdmin,
  routeParams,
  run,
  setAuthCookie,
  success,
  validate
};
