const Assignment = require("../models/Assignment");
const Faculty = require("../models/Faculty");
const SchoolClass = require("../models/SchoolClass");

// ==========================================
// CREATE ASSIGNMENT
// ==========================================
const createAssignment = async (req, res) => {
  try {
    const { facultyId, classId, section, subject, room } = req.body;

    // Basic validation
    if (!facultyId || !classId || !section || !subject) {
      return res.status(400).json({
        success: false,
        message: "Faculty, class, section and subject are required",
      });
    }

    // Check faculty belongs to logged-in school
    const faculty = await Faculty.findOne({
      _id: facultyId,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found or inactive",
      });
    }

    // Check class belongs to logged-in school
    const schoolClass = await SchoolClass.findOne({
      _id: classId,
      tenantId: req.user.tenantId,
    });

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Validate section belongs to selected class
    const normalizedSection = section.trim().toUpperCase();

    if (!schoolClass.sections.includes(normalizedSection)) {
      return res.status(400).json({
        success: false,
        message: "Section does not belong to the selected class",
      });
    }

    // Prevent duplicate assignment
    const existingAssignment = await Assignment.findOne({
      tenantId: req.user.tenantId,
      facultyId,
      classId,
      section: normalizedSection,
      subject: subject.trim(),
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message:
          "This teacher is already assigned to this class, section and subject",
      });
    }

    const assignment = await Assignment.create({
      facultyId,
      classId,
      section: normalizedSection,
      subject: subject.trim(),
      room: room?.trim() || null,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate(
        "facultyId",
        "name email employeeId phone department designation experience qualification salary",
      )
      .populate("classId", "name sections")
      .select("-__v");

    return res.status(201).json({
      success: true,
      message: "Teacher assigned successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL ASSIGNMENTS
// ==========================================
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      tenantId: req.user.tenantId,
    })
      .populate(
        "facultyId",
        "name email employeeId phone department designation experience qualification salary",
      )
      .populate("classId", "name sections")
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

// ==========================================
// GET ASSIGNMENTS BY FACULTY
// ==========================================
const getAssignmentsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Verify faculty belongs to logged-in school
    const faculty = await Faculty.findOne({
      _id: facultyId,
      tenantId: req.user.tenantId,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const assignments = await Assignment.find({
      facultyId,
      tenantId: req.user.tenantId,
    })
      .populate(
        "facultyId",
        "name email employeeId phone department designation experience qualification salary",
      )
      .populate("classId", "name sections")
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get faculty assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty assignments",
      error: error.message,
    });
  }
};

// ==========================================
// GET ASSIGNMENT BY ID
// ==========================================
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    })
      .populate(
        "facultyId",
        "name email employeeId phone department designation experience qualification salary",
      )
      .populate("classId", "name sections")
      .select("-__v");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE ASSIGNMENT
// ==========================================
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const { facultyId, classId, section, subject, room, isActive } = req.body;

    const assignment = await Assignment.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // If faculty is changing, verify tenant and status
    if (facultyId && facultyId !== assignment.facultyId.toString()) {
      const faculty = await Faculty.findOne({
        _id: facultyId,
        tenantId: req.user.tenantId,
        isActive: true,
      });

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty not found or inactive",
        });
      }

      assignment.facultyId = facultyId;
    }

    // If class is changing, verify tenant
    if (classId && classId !== assignment.classId.toString()) {
      const schoolClass = await SchoolClass.findOne({
        _id: classId,
        tenantId: req.user.tenantId,
      });

      if (!schoolClass) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      assignment.classId = classId;
    }

    if (section !== undefined) {
      assignment.section = section.trim().toUpperCase();
    }

    if (subject !== undefined) {
      assignment.subject = subject.trim();
    }

    if (room !== undefined) {
      assignment.room = room?.trim() || null;
    }

    if (isActive !== undefined) {
      assignment.isActive = isActive;
    }

    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate(
        "facultyId",
        "name email employeeId phone department designation experience qualification salary",
      )
      .populate("classId", "name sections")
      .select("-__v");

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update assignment",
      error: error.message,
    });
  }
};

// ==========================================
// DEACTIVATE ASSIGNMENT
// ==========================================
const deactivateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    assignment.isActive = false;

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment deactivated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Deactivate assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate assignment",
      error: error.message,
    });
  }
};

// ==========================================
// REACTIVATE ASSIGNMENT
// ==========================================
const reactivateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    assignment.isActive = true;

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment reactivated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Reactivate assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reactivate assignment",
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentsByFaculty,
  getAssignmentById,
  updateAssignment,
  deactivateAssignment,
  reactivateAssignment,
};
