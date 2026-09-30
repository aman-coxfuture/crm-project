const express = require("express");

const router = express.Router();

const {
  createFee,
  getAllFees,
  getFeeById,
  getStudentFees,
  getMyStudentFees,
  updateFee,
  deactivateFee,
} = require("../controllers/feeController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

router.use(authMiddleware);

// Student can view only their own fees
router.get("/my", authorizeRoles("STUDENT"), getMyStudentFees);

// Admin-only fee management
router.use(authorizeRoles("ADMIN"));

// Create Fee
router.post("/", createFee);

// Get All Fees
router.get("/", getAllFees);

// Get Fees By Student
router.get("/student/:studentId", getStudentFees);

// Get Fee By ID
router.get("/:id", getFeeById);

// Update Fee
router.put("/:id", updateFee);

// Deactivate Fee
router.patch("/:id/deactivate", deactivateFee);

module.exports = router;
