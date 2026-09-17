const express = require("express");

const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deactivateExam,
  reactivateExam,
} = require("../controllers/examController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

// =====================================================
// AUTHENTICATION + SCHOOL TENANT
// =====================================================

router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

// =====================================================
// EXAMINATION ROUTES
// =====================================================

// Get all active examinations
router.get("/", getExams);

// Get single examination
router.get("/:id", getExamById);

// Create examination
router.post("/", createExam);

// Update examination
router.put("/:id", updateExam);

// Deactivate examination
router.patch("/:id/deactivate", deactivateExam);

// Reactivate examination
router.patch("/:id/reactivate", reactivateExam);

module.exports = router;
