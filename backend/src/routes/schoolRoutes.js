const express = require("express");

const { getMySchool } = require("../controllers/schoolController");

const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN"),
  getMySchool,
);

module.exports = router;
