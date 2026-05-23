// auth-service/utils/auth.js
const jwt = require("jsonwebtoken");

function verifyAccessToken(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function verifyRefreshToken(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
};