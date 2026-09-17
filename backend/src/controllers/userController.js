const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

const createSchoolAdmin = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    if (!name || !email || !password || !tenantId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and tenantId are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "ADMIN",
      tenantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "School Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        tenantId: admin.tenantId,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error("Create School Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create school admin",
      error: error.message,
    });
  }
};

module.exports = {
  createSchoolAdmin,
};
