const express = require("express");

const {
  getTimetable,
  createTimetable,
  updateTimetable,
  deactivateTimetable,
  reactivateTimetable,
} = require("../controllers/timetableController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

// All timetable routes require School Admin authentication
router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

// Get timetable
router.get("/", getTimetable);

// Create timetable entry
router.post("/", createTimetable);

// Update timetable entry
router.put("/:id", updateTimetable);

// Deactivate timetable entry
router.patch("/:id/deactivate", deactivateTimetable);

// Reactivate timetable entry
router.patch("/:id/reactivate", reactivateTimetable);

module.exports = router;
