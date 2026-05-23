// server/middlewares/socketAuth.js
const { verifyAccessToken } = require("../utils/auth");
const cookie = require("cookie");
const { log } = require("/shared/logger");

module.exports = (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    log("Socket handshake cookies", {
      rawCookie,
    });

    if (!rawCookie) {
      log("Socket auth failed: no cookies");
      return next(new Error("No cookies found"));
    }

    const parsed = cookie.parse(rawCookie);

    log("Parsed cookies", parsed);

    const token = parsed.accessToken;

    if (!token) {
      log("Socket auth failed: no access token");
      return next(new Error("No access token"));
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      log("Socket auth failed: invalid token");
      return next(new Error("Unauthorized"));
    }

    socket.user = decoded;

    log("Socket authenticated", {
      user: decoded.email,
    });

    next();
  } catch (err) {
    log("Socket auth error", {
      error: err.message,
    });

    next(new Error("Unauthorized"));
  }
};