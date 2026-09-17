const express = require("express");

const { createSchoolAdmin } = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.post(
  "/school-admin",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN"),
  createSchoolAdmin,
);

module.exports = router;
