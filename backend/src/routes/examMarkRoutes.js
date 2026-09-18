const express = require("express");

const {
  getExamMarks,
  getExamMarkById,
  createExamMark,
  updateExamMark,
  deactivateExamMark,
  getStudentResult,
} = require("../controllers/examMarkController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

router.get("/", getExamMarks);
router.get("/result/:examId/:studentId", getStudentResult);
router.get("/:id", getExamMarkById);

router.post("/", createExamMark);

router.put("/:id", updateExamMark);

router.patch("/:id/deactivate", deactivateExamMark);

module.exports = router;
