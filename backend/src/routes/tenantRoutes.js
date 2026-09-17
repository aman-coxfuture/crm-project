const express = require("express");

const {
  createTenant,
  getAllTenants,
  updateTenant,
  deleteTenant,
  reactivateTenant,
} = require("../controllers/tenantController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();
router.get("/", authMiddleware, authorizeRoles("SUPER_ADMIN"), getAllTenants);

router.post("/", authMiddleware, authorizeRoles("SUPER_ADMIN"), createTenant);

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

module.exports = router;
