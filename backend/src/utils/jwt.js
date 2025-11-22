const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) =>
  jwt.sign(
    { userId: payload.userId, role: payload.role, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

const verifyToken = (token, secret = process.env.JWT_SECRET) =>
  jwt.verify(token, secret);

module.exports = { generateAccessToken, verifyToken };
