const express = require("express");

const router = express.Router();

const {
  generateSalarySlip,
  downloadSalarySlip,
  getSalarySlips,
} = require("../controllers/salarySlipController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

// Generate salary slip
router.post("/generate", generateSalarySlip);

router.get("/", getSalarySlips);

router.get("/:id/download", downloadSalarySlip);

module.exports = router;
