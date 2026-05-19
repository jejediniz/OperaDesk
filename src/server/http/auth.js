const jwt = require("jsonwebtoken");

const AppError = require("../utils/AppError");
const { getEnv } = require("../config/env");
const { readAuthCookie } = require("./cookies");

function getTokenFromRequest(request) {
  const cookieToken = readAuthCookie(request);
  if (cookieToken) return cookieToken;

  if (process.env.NODE_ENV !== "production") {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;

    const [scheme, token] = authHeader.split(" ");
    return scheme === "Bearer" && token ? token : null;
  }

  return null;
}

function authenticate(request) {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new AppError("Não autenticado", 401);
  }

  try {
    const decoded = jwt.verify(token, getEnv().jwtSecret);

    if (!decoded.id) {
      throw new AppError("Token inválido", 401);
    }

    return {
      id: decoded.id,
      tipo: decoded.tipo,
      admin: decoded.admin === true
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Sessão expirada ou inválida", 401);
  }
}

function requireAdmin(user) {
  if (!user || user.admin !== true) {
    throw new AppError("Acesso permitido apenas para administradores", 403);
  }
}

function requireTiOuAdmin(user) {
  if (!user) {
    throw new AppError("Acesso não autorizado", 401);
  }

  if (user.tipo !== "ti" && user.admin !== true) {
    throw new AppError("Acesso permitido apenas para técnicos ou administradores", 403);
  }
}

module.exports = {
  authenticate,
  getTokenFromRequest,
  requireAdmin,
  requireTiOuAdmin
};
