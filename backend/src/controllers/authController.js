const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Tenant = require("../models/Tenant");

const getLoginSchools = async (req, res) => {
  try {
    const schools = await Tenant.find({
      type: "SCHOOL",
      status: "ACTIVE",
    })
      .select("_id name code")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: schools.length,
      schools,
    });
  } catch (error) {
    console.error("Get login schools error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load schools",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role, schoolCode } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    if (["ADMIN", "FACULTY", "STUDENT"].includes(role) && !schoolCode) {
      return res.status(400).json({
        success: false,
        message: "School code is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let account = null;

    // Find account according to selected role
    if (role === "SUPER_ADMIN") {
      account = await User.findOne({
        email: normalizedEmail,
        role: "SUPER_ADMIN",
      });
    } else if (["ADMIN", "FACULTY", "STUDENT"].includes(role)) {
      const normalizedSchoolCode = schoolCode.toUpperCase().trim();

      // Find active school
      const tenant = await Tenant.findOne({
        code: normalizedSchoolCode,
        type: "SCHOOL",
        status: "ACTIVE",
      });

      if (!tenant) {
        return res.status(401).json({
          success: false,
          message: "Invalid or inactive school code",
        });
      }

      // Find user inside that school
      if (role === "ADMIN") {
        account = await User.findOne({
          email: normalizedEmail,
          role: "ADMIN",
          tenantId: tenant._id,
        });
      } else if (role === "FACULTY") {
        account = await Faculty.findOne({
          email: normalizedEmail,
          tenantId: tenant._id,
        });
      } else if (role === "STUDENT") {
        account = await Student.findOne({
          email: normalizedEmail,
          tenantId: tenant._id,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Account not found
    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!account.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: account._id,
        role,
        tenantId: account.tenantId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        role,
        tenantId: account.tenantId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  login,
  getLoginSchools,
};
