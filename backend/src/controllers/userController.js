const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

const createSchoolAdmin = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !tenantId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and tenantId are required",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check school exists and is active
    const school = await Tenant.findOne({
      _id: tenantId,
      type: "SCHOOL",
      status: "ACTIVE",
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "Active school not found",
      });
    }

    // Check email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create School Admin
    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "ADMIN",
      tenantId: school._id,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "School Admin created successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        tenantId: admin.tenantId,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Create school admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createSchoolAdmin,
};
