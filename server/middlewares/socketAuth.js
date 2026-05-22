const { verifyAccessToken } = require("../utils/auth");
const cookie = require("cookie");
const { log } = require("/shared/logger");

module.exports = (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) return next(new Error("No cookies found"));

    const parsed = cookie.parse(rawCookie);
    const token = parsed.accessToken;

    const decoded = verifyAccessToken(token);

    if (!decoded) return next(new Error("Unauthorized"));

    socket.user = decoded;
    next();
  } catch (err) {
    log("Auth error:", { error: err.message });
    next(new Error("Unauthorized"));
  }
};