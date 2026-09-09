const express = require("express");

const router = express.Router();

const {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
} = require("../controllers/classController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

router.post("/", authMiddleware, authorizeRoles("ADMIN"), createClass);
router.get("/", authMiddleware, authorizeRoles("ADMIN"), getAllClasses);
router.get("/:id", authMiddleware, authorizeRoles("ADMIN"), getClassById);
router.put("/:id", authMiddleware, authorizeRoles("ADMIN"), updateClass);
module.exports = router;
