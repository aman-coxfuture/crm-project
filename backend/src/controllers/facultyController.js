const bcrypt = require("bcryptjs");

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
      experience,
      qualification,
      salary,
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
    const existingFaculty = await Faculty.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingFaculty) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check duplicate employee ID inside this school
    const existingEmployee = await Faculty.findOne({
      tenantId: req.user.tenantId,
      employeeId: employeeId.trim(),
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee ID already exists in this school",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Faculty directly
    const faculty = await Faculty.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      employeeId: employeeId.trim(),
      phone: phone?.trim() || null,
      department: department?.trim() || null,
      designation: designation?.trim() || null,
      experience: experience?.trim() || null,
      qualification: qualification?.trim() || null,
      salary: salary?.trim() || null,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        employeeId: faculty.employeeId,
        phone: faculty.phone,
        department: faculty.department,
        designation: faculty.designation,
        experience: faculty.experience,
        qualification: faculty.qualification,
        salary: faculty.salary,
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
      .select("-password -__v")
      .sort({ createdAt: -1 });

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
    }).select("-password -__v");

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
      password,
      employeeId,
      phone,
      department,
      designation,
      experience,
      qualification,
      salary,
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

    // Email update
    if (email && email.toLowerCase().trim() !== faculty.email) {
      const existingEmail = await Faculty.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: faculty._id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      faculty.email = email.toLowerCase().trim();
    }

    // Name update
    if (name) {
      faculty.name = name.trim();
    }

    // Password update
    if (password) {
      faculty.password = await bcrypt.hash(password, 10);
    }

    // Faculty profile updates
    if (employeeId) {
      const existingEmployee = await Faculty.findOne({
        tenantId: req.user.tenantId,
        employeeId: employeeId.trim(),
        _id: { $ne: faculty._id },
      });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: "Employee ID already exists in this school",
        });
      }

      faculty.employeeId = employeeId.trim();
    }

    if (phone !== undefined) {
      faculty.phone = phone?.trim() || null;
    }

    if (department !== undefined) {
      faculty.department = department?.trim() || null;
    }

    if (designation !== undefined) {
      faculty.designation = designation?.trim() || null;
    }

    if (experience !== undefined) {
      faculty.experience = experience?.trim() || null;
    }

    if (qualification !== undefined) {
      faculty.qualification = qualification?.trim() || null;
    }

    if (salary !== undefined) {
      faculty.salary = salary?.trim() || null;
    }

    if (isActive !== undefined) {
      faculty.isActive = isActive;
    }

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        employeeId: faculty.employeeId,
        phone: faculty.phone,
        department: faculty.department,
        designation: faculty.designation,
        experience: faculty.experience,
        qualification: faculty.qualification,
        salary: faculty.salary,
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

    faculty.isActive = false;

    await faculty.save();

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

    faculty.isActive = true;

    await faculty.save();

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
