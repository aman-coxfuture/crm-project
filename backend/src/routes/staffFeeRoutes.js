const express = require("express");

const router = express.Router();

const {
  createStaffFee,
  getAllStaffFees,
  getStaffFeeById,
  updateStaffFee,
  recordStaffPayment,
  getStaffPaymentHistory,
  getEmployeePaymentHistory,
  deactivateStaffFee,
  generateStaffFeeLedgers,
} = require("../controllers/staffFeeController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

// Staff fee / salary ledger
router.post("/", createStaffFee);
router.post("/generate", generateStaffFeeLedgers);
router.get("/", getAllStaffFees);

router.post("/payments", recordStaffPayment);
router.get("/payments/history", getStaffPaymentHistory);
router.get("/payments/employee/:employeeId", getEmployeePaymentHistory);

router.get("/:id", getStaffFeeById);
router.put("/:id", updateStaffFee);
router.patch("/:id/deactivate", deactivateStaffFee);

module.exports = router;
