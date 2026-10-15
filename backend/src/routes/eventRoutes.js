const express = require("express");
const router = express.Router();

const {
  getEventsByRole,
  createEvent,
  deleteEvent,
} = require("../controllers/eventController");

const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

// Get events
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN", "FACULTY"),
  getEventsByRole,
);

// Create event
router.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN", "FACULTY"),
  createEvent,
);

// Delete event
router.delete(
  "/:id",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN", "FACULTY"),
  deleteEvent,
);

module.exports = router;
