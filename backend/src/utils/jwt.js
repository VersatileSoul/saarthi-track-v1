const jwt = require("jsonwebtoken");

/**
 * Generate access token
 * @param {Object} payload - TOken Payload (userId, role)
 * @returns {String} JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      type: "access",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload (userId)
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
    }
  );
};

/**
 * Generate email verification token
 * @param {Object} payload - Token payload (userId, email)
 * @returns {String} JWT verification token
 */
const generateVerificationToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: "verification",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

/**
 * Generate password reset token
 * @param {Object} payload - Token payload (userId, email)
 * @returns {String} JWT reset token
 */
const generateResetToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: "reset",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h", // Reset token expires in 1 hour
    }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @param {String} secret - Secret key (optional, defaults to JWT_SECRET)
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid Token");
    } else {
      throw new Error("Token Verification Failed");
    }
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generateResetToken,
  verifyToken,
  decodeToken,
};
