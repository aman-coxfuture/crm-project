const express = require("express");
const router = express.Router();

const {
  getFeeSetting,
  saveFeeSetting,
} = require("../controllers/feeSettingController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));

router.get("/", getFeeSetting);
router.put("/", saveFeeSetting);

module.exports = router;
