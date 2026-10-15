const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
  getSuperAdminAnalytics,
} = require("../controllers/superAdminAnalyticsController");

router.get(
  "/",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getSuperAdminAnalytics,
);

module.exports = router;
