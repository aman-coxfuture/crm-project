const Tenant = require("../models/Tenant");

const createTenant = async (req, res) => {
  try {
    const { name, code, type, email, phone, address } = req.body;

    // Validate required fields
    if (!name || !code || !type || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, code, type and email are required",
      });
    }

    // Only School is functional for now
    if (type !== "SCHOOL") {
      return res.status(400).json({
        success: false,
        message: "Currently only SCHOOL tenant can be created",
      });
    }

    // Check duplicate code
    const existingCode = await Tenant.findOne({
      code: code.toUpperCase().trim(),
    });

    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: "Tenant code already exists",
      });
    }

    // Check duplicate email
    const existingEmail = await Tenant.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Tenant email already exists",
      });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      type,
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      status: "ACTIVE",
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "School created successfully",
      tenant: {
        id: tenant._id,
        name: tenant.name,
        code: tenant.code,
        type: tenant.type,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        status: tenant.status,
        createdBy: tenant.createdBy,
        createdAt: tenant.createdAt,
      },
    });
  } catch (error) {
    console.error("Create tenant error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({
      type: "SCHOOL",
      status: "ACTIVE",
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: tenants.length,
      tenants,
    });
  } catch (error) {
    console.error("Get tenants error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, status } = req.body;

    // Check whether school exists
    const tenant = await Tenant.findOne({
      _id: id,
      type: "SCHOOL",
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Check duplicate email
    if (email && email.toLowerCase().trim() !== tenant.email) {
      const existingEmail = await Tenant.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Tenant email already exists",
        });
      }
    }

    // Update allowed fields only
    if (name !== undefined) {
      tenant.name = name.trim();
    }

    if (email !== undefined) {
      tenant.email = email.toLowerCase().trim();
    }

    if (phone !== undefined) {
      tenant.phone = phone.trim() || null;
    }

    if (address !== undefined) {
      tenant.address = address.trim() || null;
    }

    if (status !== undefined) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      tenant.status = status;
    }

    await tenant.save();

    return res.status(200).json({
      success: true,
      message: "School updated successfully",
      tenant: {
        id: tenant._id,
        name: tenant.name,
        code: tenant.code,
        type: tenant.type,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        status: tenant.status,
        createdBy: tenant.createdBy,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update tenant error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findOne({
      _id: id,
      type: "SCHOOL",
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Soft delete
    tenant.status = "INACTIVE";

    await tenant.save();

    return res.status(200).json({
      success: true,
      message: "School deactivated successfully",
      tenant: {
        id: tenant._id,
        name: tenant.name,
        code: tenant.code,
        type: tenant.type,
        status: tenant.status,
      },
    });
  } catch (error) {
    console.error("Delete tenant error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const reactivateTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findOne({
      _id: id,
      type: "SCHOOL",
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    if (tenant.status === "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "School is already active",
      });
    }

    tenant.status = "ACTIVE";

    await tenant.save();

    return res.status(200).json({
      success: true,
      message: "School reactivated successfully",
      tenant: {
        id: tenant._id,
        name: tenant.name,
        code: tenant.code,
        type: tenant.type,
        status: tenant.status,
      },
    });
  } catch (error) {
    console.error("Reactivate tenant error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createTenant,
  getAllTenants,
  updateTenant,
  deleteTenant,
  reactivateTenant,
};
