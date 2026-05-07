const jwt = require("jsonwebtoken");
require("dotenv").config();  

const SECRET = process.env.JWT_SECRET;

exports.generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};