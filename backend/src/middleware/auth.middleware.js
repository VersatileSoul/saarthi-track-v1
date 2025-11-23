const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        success: false,
        message:
          "No token provided. Authorization header must be in format: Bearer <token>",
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || "Invalid or expired token",
      });
    }

    // Check if token is access token
    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: error.message || "Invalid token type. Access token required",
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is inactive",
      });
    }

    // Add user to request object
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      user: user,
    };
    next();
  } catch (err) {
    console.error("Auth middleware error: ", err);
    return res.status(500).json({
      success: false,
      message: "Authentication Error",
    });
  }
};

module.exports = authMiddleware;
