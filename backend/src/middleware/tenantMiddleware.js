const tenantMiddleware = (req, res, next) => {
  try {
    // Super Admin is not restricted to a single tenant
    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    // Every other user must belong to a tenant
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with any tenant",
      });
    }

    // Make tenantId available to controllers
    req.tenantId = req.user.tenantId;

    next();
  } catch (error) {
    console.error("Tenant middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = tenantMiddleware;
