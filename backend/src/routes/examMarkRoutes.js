const express = require("express");

const {
  getExamMarks,
  getExamMarkById,
  createExamMark,
  updateExamMark,
  deactivateExamMark,
  getMyStudentResults,
  getStudentResult,
} = require("../controllers/examMarkController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get("/", authorizeRoles("ADMIN", "FACULTY"), getExamMarks);

router.get("/my-results", authorizeRoles("STUDENT"), getMyStudentResults);

router.get(
  "/result/:examId/:studentId",
  authorizeRoles("ADMIN", "FACULTY"),
  getStudentResult,
);

router.get("/:id", authorizeRoles("ADMIN", "FACULTY"), getExamMarkById);

router.post("/", authorizeRoles("ADMIN", "FACULTY"), createExamMark);

router.put("/:id", authorizeRoles("ADMIN", "FACULTY"), updateExamMark);

// Deactivation remains Admin-only
router.patch("/:id/deactivate", authorizeRoles("ADMIN"), deactivateExamMark);

module.exports = router;
