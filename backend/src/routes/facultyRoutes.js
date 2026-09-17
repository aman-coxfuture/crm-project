const express = require("express");

const router = express.Router();

const {
  createFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deactivateFaculty,
  reactivateFaculty,
} = require("../controllers/facultyController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

// Create Faculty
router.post("/", authMiddleware, authorizeRoles("ADMIN"), createFaculty);

router.get("/", authMiddleware, authorizeRoles("ADMIN"), getAllFaculty);

router.get("/:id", authMiddleware, authorizeRoles("ADMIN"), getFacultyById);

router.put("/:id", authMiddleware, authorizeRoles("ADMIN"), updateFaculty);

router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deactivateFaculty,
);

router.patch(
  "/:id/reactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  reactivateFaculty,
);

module.exports = router;
