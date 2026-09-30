const express = require("express");

const {
  getMyLeaves,
  applyLeave,
  getAllLeaves,
  reviewLeave,
} = require("../controllers/leaveController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get("/me", authorizeRoles("FACULTY"), getMyLeaves);

router.post("/", authorizeRoles("FACULTY"), applyLeave);

router.get("/", authorizeRoles("ADMIN"), getAllLeaves);

router.patch("/:id/review", authorizeRoles("ADMIN"), reviewLeave);

module.exports = router;
