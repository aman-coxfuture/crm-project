const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
  getInstitutionSettings,
  updateInstitutionSettings,
  getSuperAdminSettings,
  updateSuperAdminSettings,
} = require("../controllers/settingsController");

// Get institution settings
router.get(
  "/institution",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN"),
  getInstitutionSettings,
);

// Update institution settings
router.put(
  "/institution",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN"),
  updateInstitutionSettings,
);

// Get global Super Admin settings
router.get(
  "/super-admin",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getSuperAdminSettings,
);

// Update global Super Admin settings
router.put(
  "/super-admin",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  updateSuperAdminSettings,
);

module.exports = router;
