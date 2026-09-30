const express = require("express");

const {
  getStudentAttendance,
  markStudentAttendance,
  updateStudentAttendance,
} = require("../controllers/studentAttendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Teacher/Admin can view student attendance
router.get(
  "/",
  authorizeRoles("ADMIN", "FACULTY", "STUDENT"),
  getStudentAttendance,
);

// Teacher can mark attendance
router.post("/", authorizeRoles("FACULTY"), markStudentAttendance);

// Teacher can update attendance
router.put("/:id", authorizeRoles("FACULTY"), updateStudentAttendance);

module.exports = router;
