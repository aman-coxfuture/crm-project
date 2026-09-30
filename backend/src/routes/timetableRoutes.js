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

router.use(authMiddleware);
router.use(tenantMiddleware);

// ADMIN + FACULTY can view timetable
router.get("/", authorizeRoles("ADMIN", "FACULTY", "STUDENT"), getTimetable);

// Only ADMIN can manage timetable
router.post("/", authorizeRoles("ADMIN"), createTimetable);

router.put("/:id", authorizeRoles("ADMIN"), updateTimetable);

router.patch("/:id/deactivate", authorizeRoles("ADMIN"), deactivateTimetable);

router.patch("/:id/reactivate", authorizeRoles("ADMIN"), reactivateTimetable);

module.exports = router;
