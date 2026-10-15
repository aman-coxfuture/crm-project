const express = require("express");

const {
  createTenant,
  getAllTenants,
  updateTenant,
  deleteTenant,
  reactivateTenant,
  getTenantAdmin,
  updateTenantAdmin,
  getTenantStats,
} = require("../controllers/tenantController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();
router.get("/", authMiddleware, authorizeRoles("SUPER_ADMIN"), getAllTenants);

router.post("/", authMiddleware, authorizeRoles("SUPER_ADMIN"), createTenant);

router.get(
  "/stats",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getTenantStats,
);

router.put("/:id", authMiddleware, authorizeRoles("SUPER_ADMIN"), updateTenant);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  deleteTenant,
);

router.patch(
  "/:id/reactivate",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  reactivateTenant,
);

router.get(
  "/:id/admin",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  getTenantAdmin,
);

router.put(
  "/:id/admin",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  updateTenantAdmin,
);

module.exports = router;
