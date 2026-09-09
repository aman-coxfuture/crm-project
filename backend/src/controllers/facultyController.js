const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Faculty = require("../models/Faculty");
const Tenant = require("../models/Tenant");

const createFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      phone,
      department,
      designation,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and employee ID are required",
      });
    }

    // School Admin must belong to a school
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    // Verify school exists
    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Check duplicate email globally
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check duplicate employee ID inside this school
    const existingFaculty = await Faculty.findOne({
      tenantId: req.user.tenantId,
      employeeId: employeeId.trim(),
    });

    if (existingFaculty) {
      return res.status(409).json({
        success: false,
        message: "Employee ID already exists in this school",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User account
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "FACULTY",
      tenantId: req.user.tenantId,
      isActive: true,
    });

    // Create Faculty profile
    const faculty = await Faculty.create({
      userId: user._id,
      employeeId: employeeId.trim(),
      phone: phone?.trim() || null,
      department: department?.trim() || null,
      designation: designation?.trim() || null,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      faculty: {
        id: faculty._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        employeeId: faculty.employeeId,
        phone: faculty.phone,
        department: faculty.department,
        designation: faculty.designation,
        tenantId: faculty.tenantId,
        isActive: faculty.isActive,
        createdAt: faculty.createdAt,
      },
    });
  } catch (error) {
    console.error("Create faculty error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllFaculty = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const faculty = await Faculty.find({
      tenantId: req.user.tenantId,
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: faculty.length,
      faculty,
    });
  } catch (error) {
    console.error("Get faculty error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const faculty = await Faculty.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    }).populate("userId", "name email role isActive");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    return res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    console.error("Get faculty by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      employeeId,
      phone,
      department,
      designation,
      isActive,
    } = req.body;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    // Find faculty belonging to logged-in admin's school
    const faculty = await Faculty.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // Update User information
    const user = await User.findOne({
      _id: faculty.userId,
      tenantId: req.user.tenantId,
      role: "FACULTY",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Faculty user account not found",
      });
    }

    // Email update
    if (email && email.toLowerCase().trim() !== user.email) {
      const existingEmail = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      user.email = email.toLowerCase().trim();
    }

    if (name) {
      user.name = name.trim();
    }

    // Update User
    await user.save();

    // Update Faculty information
    if (employeeId) faculty.employeeId = employeeId.trim();
    if (phone !== undefined) faculty.phone = phone?.trim() || null;
    if (department !== undefined) {
      faculty.department = department?.trim() || null;
    }
    if (designation !== undefined) {
      faculty.designation = designation?.trim() || null;
    }
    if (isActive !== undefined) {
      faculty.isActive = isActive;
      user.isActive = isActive;
      await user.save();
    }

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
      faculty: {
        id: faculty._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        employeeId: faculty.employeeId,
        phone: faculty.phone,
        department: faculty.department,
        designation: faculty.designation,
        tenantId: faculty.tenantId,
        isActive: faculty.isActive,
        updatedAt: faculty.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update faculty error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deactivateFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const faculty = await Faculty.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const user = await User.findOne({
      _id: faculty.userId,
      tenantId: req.user.tenantId,
      role: "FACULTY",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Faculty user account not found",
      });
    }

    // Deactivate both faculty profile and login account
    faculty.isActive = false;
    user.isActive = false;

    await faculty.save();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Faculty deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate faculty error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const reactivateFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const faculty = await Faculty.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const user = await User.findOne({
      _id: faculty.userId,
      tenantId: req.user.tenantId,
      role: "FACULTY",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Faculty user account not found",
      });
    }

    faculty.isActive = true;
    user.isActive = true;

    await faculty.save();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Faculty reactivated successfully",
    });
  } catch (error) {
    console.error("Reactivate faculty error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deactivateFaculty,
  reactivateFaculty,
};
