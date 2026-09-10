const express = require("express");

const router = express.Router();

const {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deactivateClass,
  reactivateClass,
} = require("../controllers/classController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

router.post("/", authMiddleware, authorizeRoles("ADMIN"), createClass);
router.get("/", authMiddleware, authorizeRoles("ADMIN"), getAllClasses);
router.get("/:id", authMiddleware, authorizeRoles("ADMIN"), getClassById);
router.put("/:id", authMiddleware, authorizeRoles("ADMIN"), updateClass);
router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deactivateClass,
);
router.patch(
  "/:id/reactivate",
  authMiddleware,
  authorizeRoles("ADMIN"),
  reactivateClass,
);
module.exports = router;
