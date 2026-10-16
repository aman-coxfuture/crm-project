const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const { getReports } = require("../controllers/reportController");

router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN"),
  getReports,
);

module.exports = router;
