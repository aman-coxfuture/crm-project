const express = require("express");

const { login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.post("/login", login);

router.get("/me", authMiddleware, authorizeRoles("SUPER_ADMIN"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Super Admin access granted",
    user: req.user,
  });
});

module.exports = router;
