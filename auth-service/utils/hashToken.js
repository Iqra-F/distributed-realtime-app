// auth-service/utils/hashToken.js
const crypto = require("crypto");

exports.hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};