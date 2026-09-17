const express = require("express");

const {
  getFacultyAttendance,
  markFacultyAttendance,
  updateFacultyAttendance,
} = require("../controllers/facultyAttendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

router.get("/", getFacultyAttendance);
router.post("/", markFacultyAttendance);
router.put("/:id", updateFacultyAttendance);

module.exports = router;
