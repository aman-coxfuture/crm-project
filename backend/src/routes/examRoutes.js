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

// Authentication + Tenant
router.use(authMiddleware);
router.use(tenantMiddleware);

// ===============================
// FACULTY + ADMIN — VIEW EXAMS
// ===============================

router.get("/", authorizeRoles("ADMIN", "FACULTY"), getExams);

router.get("/:id", authorizeRoles("ADMIN", "FACULTY"), getExamById);

// ===============================
// ADMIN ONLY — MANAGE EXAMS
// ===============================

router.post("/", authorizeRoles("ADMIN"), createExam);

router.put("/:id", authorizeRoles("ADMIN"), updateExam);

router.patch("/:id/deactivate", authorizeRoles("ADMIN"), deactivateExam);

router.patch("/:id/reactivate", authorizeRoles("ADMIN"), reactivateExam);

module.exports = router;
