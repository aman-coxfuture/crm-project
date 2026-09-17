const express = require("express");

const {
  getStaff,
  createStaff,
  updateStaff,
  deactivateStaff,
  reactivateStaff,
} = require("../controllers/staffController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

// All Staff APIs → School Admin only
router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

// Get all staff
router.get("/", getStaff);

// Create staff
router.post("/", createStaff);

// Update staff
router.put("/:id", updateStaff);

// Deactivate staff
router.patch("/:id/deactivate", deactivateStaff);

// Reactivate staff
router.patch("/:id/reactivate", reactivateStaff);

module.exports = router;
