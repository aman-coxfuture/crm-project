const TransportDriver = require("../models/TransportDriver");
const TransportVehicle = require("../models/TransportVehicle");
const TransportRoute = require("../models/TransportRoute");

// =====================================================
// DRIVERS
// =====================================================

// GET ALL DRIVERS
const getDrivers = async (req, res) => {
  try {
    const drivers = await TransportDriver.find({
      tenantId: req.tenantId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    console.error("Get drivers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
      error: error.message,
    });
  }
};

// CREATE DRIVER
const createDriver = async (req, res) => {
  try {
    const {
      name,
      phone,
      licenseNumber,
      vehicleNumber,
      vehicleType,
      route,
      assignedStudents,
      joiningDate,
      status,
    } = req.body;

    if (!name || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "Driver name and license number are required",
      });
    }

    const existingDriver = await TransportDriver.findOne({
      tenantId: req.tenantId,
      licenseNumber,
    });

    if (existingDriver) {
      return res.status(409).json({
        success: false,
        message: "Driver with this license number already exists",
      });
    }

    const driver = await TransportDriver.create({
      tenantId: req.tenantId,
      name,
      phone,
      licenseNumber,
      vehicleNumber,
      vehicleType,
      route,
      assignedStudents,
      joiningDate,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: driver,
    });
  } catch (error) {
    console.error("Create driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create driver",
      error: error.message,
    });
  }
};

// UPDATE DRIVER
const updateDriver = async (req, res) => {
  try {
    const driver = await TransportDriver.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const allowedFields = [
      "name",
      "phone",
      "licenseNumber",
      "vehicleNumber",
      "vehicleType",
      "route",
      "assignedStudents",
      "joiningDate",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        driver[field] = req.body[field];
      }
    });

    await driver.save();

    return res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: driver,
    });
  } catch (error) {
    console.error("Update driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update driver",
      error: error.message,
    });
  }
};

// DEACTIVATE DRIVER
const deactivateDriver = async (req, res) => {
  try {
    const driver = await TransportDriver.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.tenantId,
      },
      {
        status: "Inactive",
      },
      {
        new: true,
      },
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver deactivated successfully",
      data: driver,
    });
  } catch (error) {
    console.error("Deactivate driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate driver",
      error: error.message,
    });
  }
};

// REACTIVATE DRIVER
const reactivateDriver = async (req, res) => {
  try {
    const driver = await TransportDriver.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.tenantId,
      },
      {
        status: "Active",
      },
      {
        new: true,
      },
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver reactivated successfully",
      data: driver,
    });
  } catch (error) {
    console.error("Reactivate driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reactivate driver",
      error: error.message,
    });
  }
};

// =====================================================
// VEHICLES
// =====================================================

// GET ALL VEHICLES
const getVehicles = async (req, res) => {
  try {
    const vehicles = await TransportVehicle.find({
      tenantId: req.tenantId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get vehicles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles",
      error: error.message,
    });
  }
};

// CREATE VEHICLE
const createVehicle = async (req, res) => {
  try {
    const { vehicleNumber, type, capacity, driver, insuranceExpiry, status } =
      req.body;

    if (!vehicleNumber || !type || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number, type and capacity are required",
      });
    }

    const existingVehicle = await TransportVehicle.findOne({
      tenantId: req.tenantId,
      vehicleNumber,
    });

    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: "Vehicle with this number already exists",
      });
    }

    const vehicle = await TransportVehicle.create({
      tenantId: req.tenantId,
      vehicleNumber,
      type,
      capacity,
      driver,
      insuranceExpiry,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle",
      error: error.message,
    });
  }
};

// UPDATE VEHICLE
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await TransportVehicle.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const allowedFields = [
      "vehicleNumber",
      "type",
      "capacity",
      "driver",
      "insuranceExpiry",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        vehicle[field] = req.body[field];
      }
    });

    await vehicle.save();

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle",
      error: error.message,
    });
  }
};

// =====================================================
// ROUTES
// =====================================================

// GET ALL ROUTES
const getRoutes = async (req, res) => {
  try {
    const routes = await TransportRoute.find({
      tenantId: req.tenantId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    console.error("Get routes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
      error: error.message,
    });
  }
};

// CREATE ROUTE
const createRoute = async (req, res) => {
  try {
    const {
      name,
      driver,
      vehicle,
      totalStudents,
      pickupTime,
      dropTime,
      stops,
      status,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Route name is required",
      });
    }

    const route = await TransportRoute.create({
      tenantId: req.tenantId,
      name,
      driver,
      vehicle,
      totalStudents,
      pickupTime,
      dropTime,
      stops,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: route,
    });
  } catch (error) {
    console.error("Create route error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create route",
      error: error.message,
    });
  }
};

module.exports = {
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
};
