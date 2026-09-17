const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let account = null;

    // Find account according to selected role
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      account = await User.findOne({
        email: normalizedEmail,
        role,
      });
    } else if (role === "FACULTY") {
      account = await Faculty.findOne({
        email: normalizedEmail,
      });
    } else if (role === "STUDENT") {
      account = await Student.findOne({
        email: normalizedEmail,
      });
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
};
