const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Student = require("../models/Student");
const Tenant = require("../models/Tenant");
const SchoolClass = require("../models/SchoolClass");

const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      admissionNumber,
      dateOfBirth,
      gender,
      phone,
      address,
      classId,
      className,
      section,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and admission number are required",
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

    let schoolClass = null;

    if (classId) {
      schoolClass = await SchoolClass.findOne({
        _id: classId,
        tenantId: req.user.tenantId,
        isActive: true,
      });

      if (!schoolClass) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive class",
        });
      }

      if (
        section &&
        !schoolClass.sections.includes(section.trim().toUpperCase())
      ) {
        return res.status(400).json({
          success: false,
          message: "Section does not belong to the selected class",
        });
      }
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

    // Check duplicate admission number in this school
    const existingStudent = await Student.findOne({
      tenantId: req.user.tenantId,
      admissionNumber: admissionNumber.trim(),
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Admission number already exists in this school",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User account
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "STUDENT",
      tenantId: req.user.tenantId,
      isActive: true,
    });

    // Create Student profile
    const student = await Student.create({
      userId: user._id,
      admissionNumber: admissionNumber.trim(),
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      classId: schoolClass ? schoolClass._id : null,
      className: schoolClass ? schoolClass.name : null,
      section: section ? section.trim().toUpperCase() : null,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: {
        id: student._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        admissionNumber: student.admissionNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        phone: student.phone,
        address: student.address,
        className: student.className,
        section: student.section,
        tenantId: student.tenantId,
        isActive: student.isActive,
        createdAt: student.createdAt,
      },
    });
  } catch (error) {
    console.error("Create student error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const students = await Student.find({
      tenantId: req.user.tenantId,
    })
      .populate("userId", "name email role isActive")
      .populate("classId", "name sections isActive")
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const student = await Student.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    }).populate("userId", "name email role isActive");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      admissionNumber,
      dateOfBirth,
      gender,
      phone,
      address,
      classId,
      section,
      isActive,
    } = req.body;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    let schoolClass = null;

    if (classId) {
      schoolClass = await SchoolClass.findOne({
        _id: classId,
        tenantId: req.user.tenantId,
        isActive: true,
      });

      if (!schoolClass) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive class",
        });
      }

      if (
        section &&
        !schoolClass.sections.includes(section.trim().toUpperCase())
      ) {
        return res.status(400).json({
          success: false,
          message: "Section does not belong to the selected class",
        });
      }
    }

    // Find student belonging to logged-in admin's school
    const student = await Student.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Find associated user
    const user = await User.findOne({
      _id: student.userId,
      tenantId: req.user.tenantId,
      role: "STUDENT",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student user account not found",
      });
    }

    // Update name
    if (name) {
      user.name = name.trim();
    }

    // Update email
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

    // Update User status
    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    // Update Student profile
    if (admissionNumber) {
      const existingAdmission = await Student.findOne({
        tenantId: req.user.tenantId,
        admissionNumber: admissionNumber.trim(),
        _id: { $ne: student._id },
      });

      if (existingAdmission) {
        return res.status(409).json({
          success: false,
          message: "Admission number already exists in this school",
        });
      }

      student.admissionNumber = admissionNumber.trim();
    }

    if (dateOfBirth !== undefined) {
      student.dateOfBirth = dateOfBirth || null;
    }

    if (gender !== undefined) {
      student.gender = gender || null;
    }

    if (phone !== undefined) {
      student.phone = phone?.trim() || null;
    }

    if (address !== undefined) {
      student.address = address?.trim() || null;
    }

    if (classId !== undefined) {
      if (!classId) {
        student.classId = null;
        student.className = null;
      } else {
        student.classId = schoolClass._id;
        student.className = schoolClass.name;
      }
    }

    if (section !== undefined) {
      student.section = section ? section.trim().toUpperCase() : null;
    }

    if (isActive !== undefined) {
      student.isActive = isActive;
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: {
        id: student._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        admissionNumber: student.admissionNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        phone: student.phone,
        address: student.address,
        className: student.className,
        section: student.section,
        tenantId: student.tenantId,
        isActive: student.isActive,
        updatedAt: student.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update student error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const student = await Student.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const user = await User.findOne({
      _id: student.userId,
      tenantId: req.user.tenantId,
      role: "STUDENT",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student user account not found",
      });
    }

    student.isActive = false;
    user.isActive = false;

    await student.save();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Student deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate student error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const reactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const student = await Student.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const user = await User.findOne({
      _id: student.userId,
      tenantId: req.user.tenantId,
      role: "STUDENT",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student user account not found",
      });
    }

    student.isActive = true;
    user.isActive = true;

    await student.save();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Student reactivated successfully",
    });
  } catch (error) {
    console.error("Reactivate student error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  reactivateStudent,
};
