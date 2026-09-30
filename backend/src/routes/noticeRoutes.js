const express = require("express");

const {
  getNotices,
  getStudentNotices,
  createNotice,
} = require("../controllers/noticeController");

const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();
// Student notices
router.get(
  "/student",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("STUDENT"),
  getStudentNotices,
);

// Get notices
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN", "FACULTY"),
  getNotices,
);

// Create notice
router.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN"),
  createNotice,
);

module.exports = router;
