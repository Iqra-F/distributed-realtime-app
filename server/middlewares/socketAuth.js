const jwt = require("jsonwebtoken");
const cookie = require("cookie");

module.exports = (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
      return next(new Error("No cookies found"));
    }

    const parsed = cookie.parse(rawCookie);

    const token = parsed.token;

    if (!token) {
      return next(new Error("No token"));
    }

    const decoded = jwt.verify(token, "supersecret"); // same as auth-service

    socket.user = decoded;

    next();
  } catch (err) {
    console.log("❌ Auth error:", err.message);
    next(new Error("Unauthorized"));
  }
};