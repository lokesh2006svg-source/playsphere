// Middleware to authorize Venue Admin or Super Admin
export const requireVenueAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "venue_admin" ||
      req.user.role === "super_admin" ||
      req.user.role === "admin")
  ) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Venue Admin or Super Admin privileges required.",
    });
  }
};

// Middleware to authorize Super Admin only (platform owner level)
export const requireSuperAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "super_admin" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Super Admin privileges required.",
    });
  }
};

// Backward-compatible alias
export const requireAdmin = requireVenueAdmin;

export default {
  requireVenueAdmin,
  requireSuperAdmin,
  requireAdmin,
};
