const jwt = require("jsonwebtoken");

const SECRET = "supersecret"; // later → env

exports.generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};