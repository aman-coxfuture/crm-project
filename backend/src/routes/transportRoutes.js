const express = require("express");

const {
  getDrivers,
  createDriver,
  updateDriver,
  deactivateDriver,
  reactivateDriver,
  getVehicles,
  createVehicle,
  updateVehicle,
  getRoutes,
  createRoute,
} = require("../controllers/transportController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

// All Transport APIs → School Admin only
router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));
router.use(tenantMiddleware);

// =====================================================
// DRIVERS
// =====================================================

// Get all drivers
router.get("/drivers", getDrivers);

// Create driver
router.post("/drivers", createDriver);

// Update driver
router.put("/drivers/:id", updateDriver);

// Deactivate driver
router.patch("/drivers/:id/deactivate", deactivateDriver);

// Reactivate driver
router.patch("/drivers/:id/reactivate", reactivateDriver);

// =====================================================
// VEHICLES
// =====================================================

router.get("/vehicles", getVehicles);
router.post("/vehicles", createVehicle);
router.put("/vehicles/:id", updateVehicle);

// =====================================================
// ROUTES
// =====================================================

// Get all routes
router.get("/routes", getRoutes);

// Create route
router.post("/routes", createRoute);

module.exports = router;
