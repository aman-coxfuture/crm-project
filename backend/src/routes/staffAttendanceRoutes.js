const express = require("express");

const {
  getStaffAttendance,
  markStaffAttendance,
  updateStaffAttendance,
} = require("../controllers/staffAttendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

router.get("/", getStaffAttendance);
router.post("/", markStaffAttendance);
router.put("/:id", updateStaffAttendance);

module.exports = router;
