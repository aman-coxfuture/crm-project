const express = require("express");

const router = express.Router();

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  reactivateStudent,
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

// Create Student
router.post("/", authMiddleware, authorizeRoles("ADMIN"), createStudent);

router.get("/", authMiddleware, authorizeRoles("ADMIN"), getAllStudents);

router.get("/:id", authMiddleware, authorizeRoles("ADMIN"), getStudentById);

router.put("/:id", authMiddleware, authorizeRoles("ADMIN"), updateStudent);

router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deactivateStudent,
);

router.patch(
  "/:id/reactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  reactivateStudent,
);
module.exports = router;
