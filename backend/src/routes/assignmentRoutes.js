const express = require("express");

const router = express.Router();

const {
  createAssignment,
  getAllAssignments,
  getAssignmentsByFaculty,
  getAssignmentById,
  updateAssignment,
  deactivateAssignment,
  reactivateAssignment,
} = require("../controllers/assignmentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

// Create Assignment
router.post("/", authMiddleware, authorizeRoles("ADMIN"), createAssignment);

// Get All Assignments
router.get("/", authMiddleware, authorizeRoles("ADMIN"), getAllAssignments);

// Get Assignments By Faculty
router.get(
  "/faculty/:facultyId",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAssignmentsByFaculty,
);

// Get Assignment By ID
router.get("/:id", authMiddleware, authorizeRoles("ADMIN"), getAssignmentById);

// Update Assignment
router.put("/:id", authMiddleware, authorizeRoles("ADMIN"), updateAssignment);

// Deactivate Assignment
router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deactivateAssignment,
);

// Reactivate Assignment
router.patch(
  "/:id/reactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  reactivateAssignment,
);

module.exports = router;
