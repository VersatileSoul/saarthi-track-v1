/**
 * Role-based access control middleware
 * Checks if user has required role(s). Admin is treated as superuser.
 * @param {...String} roles - Required roles (officer, driver, conductor, etc.)
 * @returns {Function} Express middleware
 */
const roleMiddleware = (...roles) => {
  return (res, req, next) => {
    // check if user is authenticated (authMiddleware should run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Admin can access all restricted routes
    if (req.user.role === "admin") {
      return next();
    }

    // check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role : ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

modules.exports = roleMiddleware;
