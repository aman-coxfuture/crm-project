const express = require("express");

const router = express.Router();

const {
  createFeePayment,
  getAllFeePayments,
  getStudentFeePayments,
  getMyFeePayments,
} = require("../controllers/feePaymentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

router.use(authMiddleware);

// Student can view only their own payment history
router.get("/my", authorizeRoles("STUDENT"), getMyFeePayments);

// Only School Admin can manage fee payments
router.use(authorizeRoles("ADMIN"));
// Record Payment
router.post("/", createFeePayment);

// Payment History
router.get("/", getAllFeePayments);

// Student Payment History
router.get("/student/:studentId", getStudentFeePayments);

module.exports = router;
