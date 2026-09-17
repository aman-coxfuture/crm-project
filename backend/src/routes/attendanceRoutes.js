const express = require("express");

const {
  getAttendance,
  markAttendance,
  updateAttendance,
  getStudentAttendanceSummary,
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

// School Admin only
router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

// Get attendance
// GET /api/attendance
// Optional: ?date=2026-09-15
// Optional: ?studentId=...
router.get("/", getAttendance);

// Get particular student's attendance summary
// GET /api/attendance/student/:studentId
router.get("/student/:studentId", getStudentAttendanceSummary);

// Mark attendance
// POST /api/attendance
router.post("/", markAttendance);

// Update attendance
// PUT /api/attendance/:id
router.put("/:id", updateAttendance);

module.exports = router;
