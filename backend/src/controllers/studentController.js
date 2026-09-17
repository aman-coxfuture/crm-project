const bcrypt = require("bcryptjs");

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
      parentName,
      parentPhone,
      emergencyContact,
      bloodGroup,
      address,
      classId,
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

    // Validate class and section
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
    const existingStudent = await Student.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check duplicate admission number inside this school
    const existingAdmission = await Student.findOne({
      tenantId: req.user.tenantId,
      admissionNumber: admissionNumber.trim(),
    });

    if (existingAdmission) {
      return res.status(409).json({
        success: false,
        message: "Admission number already exists in this school",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Student directly
    const student = await Student.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      admissionNumber: admissionNumber.trim(),
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      phone: phone?.trim() || null,
      parentName: parentName?.trim() || null,
      parentPhone: parentPhone?.trim() || null,
      emergencyContact: emergencyContact?.trim() || null,
      bloodGroup: bloodGroup?.trim() || null,
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
        name: student.name,
        email: student.email,
        admissionNumber: student.admissionNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        phone: student.phone,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        emergencyContact: student.emergencyContact,
        bloodGroup: student.bloodGroup,
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
      .select("-password -__v")
      .populate("classId", "name sections isActive")
      .sort({ createdAt: -1 });

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
    })
      .select("-password -__v")
      .populate("classId", "name sections isActive");

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
      password,
      admissionNumber,
      dateOfBirth,
      gender,
      phone,
      parentName,
      parentPhone,
      emergencyContact,
      bloodGroup,
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

    let schoolClass = null;

    // Validate class and section
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

    // Update name
    if (name) {
      student.name = name.trim();
    }

    // Update email
    if (email && email.toLowerCase().trim() !== student.email) {
      const existingEmail = await Student.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: student._id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      student.email = email.toLowerCase().trim();
    }

    // Update password
    if (password) {
      student.password = await bcrypt.hash(password, 10);
    }

    // Update admission number
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

    if (parentName !== undefined) {
      student.parentName = parentName?.trim() || null;
    }

    if (parentPhone !== undefined) {
      student.parentPhone = parentPhone?.trim() || null;
    }

    if (emergencyContact !== undefined) {
      student.emergencyContact = emergencyContact?.trim() || null;
    }

    if (bloodGroup !== undefined) {
      student.bloodGroup = bloodGroup?.trim() || null;
    }

    if (address !== undefined) {
      student.address = address?.trim() || null;
    }

    if (classId !== undefined) {
      if (!classId) {
        student.classId = null;
        student.className = null;
        student.section = null;
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
        name: student.name,
        email: student.email,
        admissionNumber: student.admissionNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        phone: student.phone,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        emergencyContact: student.emergencyContact,
        bloodGroup: student.bloodGroup,
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

    student.isActive = false;

    await student.save();

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

    student.isActive = true;

    await student.save();

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
