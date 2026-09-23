const express = require("express");

const router = express.Router();

const {
  getAcademicSessions,
  getActiveAcademicSessions,
  createAcademicSession,
  updateAcademicSession,
  deactivateAcademicSession,
} = require("../controllers/academicSessionController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

// Get all academic sessions
router.get("/", getAcademicSessions);

// Get active academic sessions
router.get("/active", getActiveAcademicSessions);

// Create academic session
router.post("/", createAcademicSession);

// Update academic session
router.put("/:id", updateAcademicSession);

// Deactivate academic session
router.patch("/:id/deactivate", deactivateAcademicSession);

module.exports = router;
