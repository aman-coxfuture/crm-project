const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Staff = require("../models/Staff");

const createTenant = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      name,
      code,
      type,
      email,
      phone,
      address,
      board,
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    if (
      !name ||
      !code ||
      !type ||
      !email ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "School details and admin credentials are required",
      });
    }

    if (type !== "SCHOOL") {
      return res.status(400).json({
        success: false,
        message: "Currently only SCHOOL tenant can be created",
      });
    }

    const normalizedCode = code.toUpperCase().trim();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedAdminEmail = adminEmail.toLowerCase().trim();

    const existingCode = await Tenant.findOne({
      code: normalizedCode,
    });

    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: "Tenant code already exists",
      });
    }

    const existingEmail = await Tenant.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Tenant email already exists",
      });
    }

    const existingAdmin = await User.findOne({
      email: normalizedAdminEmail,
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin email already exists",
      });
    }

    session.startTransaction();

    const tenant = await Tenant.create(
      [
        {
          name: name.trim(),
          code: normalizedCode,
          type,
          email: normalizedEmail,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          board: board?.trim() || null,
          status: "ACTIVE",
          createdBy: req.user.userId,
        },
      ],
      { session },
    );

    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await User.create(
      [
        {
          name: adminName.trim(),
          email: normalizedAdminEmail,
          password: hashedAdminPassword,
          role: "ADMIN",
          tenantId: tenant[0]._id,
          isActive: true,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "School created successfully",
      tenant: {
        id: tenant[0]._id,
        name: tenant[0].name,
        code: tenant[0].code,
        type: tenant[0].type,
        email: tenant[0].email,
        phone: tenant[0].phone,
        address: tenant[0].address,
        board: tenant[0].board,
        status: tenant[0].status,
        createdBy: tenant[0].createdBy,
        createdAt: tenant[0].createdAt,
      },
      admin: {
        id: adminUser[0]._id,
        name: adminUser[0].name,
        email: adminUser[0].email,
        role: adminUser[0].role,
        tenantId: adminUser[0].tenantId,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Create tenant error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    session.endSession();
  }
};

const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({
      type: "SCHOOL",
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

const getTenantStats = async (req, res) => {
  try {
    const [
      totalSchools,
      activeSchools,
      inactiveSchools,
      totalStudents,
      totalFaculty,
      totalStaff,
    ] = await Promise.all([
      Tenant.countDocuments({
        type: "SCHOOL",
      }),

      Tenant.countDocuments({
        type: "SCHOOL",
        status: "ACTIVE",
      }),

      Tenant.countDocuments({
        type: "SCHOOL",
        status: "INACTIVE",
      }),

      Student.countDocuments({
        isActive: true,
      }),

      Faculty.countDocuments({
        isActive: true,
      }),

      Staff.countDocuments({
        isActive: true,
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalSchools,
        activeSchools,
        inactiveSchools,
        totalStudents,
        totalFaculty,
        totalStaff,
      },
    });
  } catch (error) {
    console.error("Get tenant stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, board, status } = req.body;

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

    if (board !== undefined) {
      tenant.board = board.trim() || null;
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
        board: tenant.board,
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

    tenant.status = "INACTIVE";

    await tenant.save();

    // Deactivate all admin accounts belonging to this school
    await User.updateMany(
      {
        tenantId: tenant._id,
        role: "ADMIN",
      },
      {
        $set: {
          isActive: false,
        },
      },
    );

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

    // Reactivate admin accounts belonging to this school
    await User.updateMany(
      {
        tenantId: tenant._id,
        role: "ADMIN",
      },
      {
        $set: {
          isActive: true,
        },
      },
    );

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

const getTenantAdmin = async (req, res) => {
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

    const admin = await User.findOne({
      tenantId: tenant._id,
      role: "ADMIN",
    }).select("-password -__v");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "School admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        tenantId: admin.tenantId,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get tenant admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateTenantAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, isActive } = req.body;

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

    const admin = await User.findOne({
      tenantId: tenant._id,
      role: "ADMIN",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "School admin not found",
      });
    }

    if (name !== undefined) {
      admin.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      if (normalizedEmail !== admin.email) {
        const existingUser = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: admin._id },
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "Admin email already exists",
          });
        }

        admin.email = normalizedEmail;
      }
    }

    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    if (isActive !== undefined) {
      admin.isActive = isActive;
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "School admin updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        tenantId: admin.tenantId,
        isActive: admin.isActive,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update tenant admin error:", error);

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
  getTenantAdmin,
  updateTenantAdmin,
  getTenantStats,
};
