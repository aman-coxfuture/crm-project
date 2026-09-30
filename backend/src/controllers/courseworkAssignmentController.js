const CourseworkAssignment = require("../models/CourseworkAssignment");
const Faculty = require("../models/Faculty");
const SchoolClass = require("../models/SchoolClass");
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");

const createCourseworkAssignment = async (req, res) => {
  try {
    const { title, subject, classId, section, dueDate, maxMarks, description } =
      req.body;

    if (
      !title ||
      !subject ||
      !classId ||
      !section ||
      !dueDate ||
      maxMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "title, subject, classId, section, dueDate and maxMarks are required",
      });
    }

    const faculty = await Faculty.findOne({
      _id: req.user.userId,
      tenantId: req.tenantId,
      isActive: true,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const schoolClass = await SchoolClass.findOne({
      _id: classId,
      tenantId: req.tenantId,
      isActive: true,
    });

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const validSection = schoolClass.sections?.includes(section);

    if (!validSection) {
      return res.status(400).json({
        success: false,
        message: "Invalid section for selected class",
      });
    }

    const normalizedSection = section.trim().toUpperCase();
    const normalizedSubject = subject.trim();

    const teacherAssignment = await Assignment.findOne({
      facultyId: req.user.userId,
      tenantId: req.tenantId,
      classId,
      section: normalizedSection,
      subject: normalizedSubject,
      isActive: true,
    });

    if (!teacherAssignment) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this class, section and subject",
      });
    }

    const assignment = await CourseworkAssignment.create({
      title: title.trim(),
      subject: subject.trim(),
      classId,
      section: normalizedSection,
      facultyId: faculty._id,
      dueDate,
      maxMarks,
      description: description?.trim() || "",
      tenantId: req.tenantId,
    });

    const populatedAssignment = await CourseworkAssignment.findById(
      assignment._id,
    )
      .populate("classId", "name sections")
      .populate("facultyId", "name email employeeId");

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error("Create Coursework Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};

const getMyCourseworkAssignments = async (req, res) => {
  try {
    const assignments = await CourseworkAssignment.find({
      tenantId: req.tenantId,
      facultyId: req.user.userId,
      isActive: true,
    })
      .populate("classId", "name sections")
      .populate("facultyId", "name email employeeId")
      .populate("submissions.studentId", "name")
      .sort({ dueDate: 1, createdAt: -1 });

    const assignmentsWithStudentCount = await Promise.all(
      assignments.map(async (assignment) => {
        const totalStudents = await Student.countDocuments({
          tenantId: req.tenantId,
          classId: assignment.classId?._id || assignment.classId,
          section: assignment.section,
          isActive: true,
        });

        return {
          ...assignment.toObject(),
          totalStudents,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      assignments: assignmentsWithStudentCount,
    });
  } catch (error) {
    console.error("Get My Coursework Assignments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

const getStudentCourseworkAssignments = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.user.userId,
      tenantId: req.tenantId,
      isActive: true,
    }).select("classId section");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!student.classId || !student.section) {
      return res.status(400).json({
        success: false,
        message: "Student class or section is not assigned",
      });
    }

    const assignments = await CourseworkAssignment.find({
      tenantId: req.tenantId,
      classId: student.classId,
      section: student.section,
      isActive: true,
    })
      .populate("classId", "name sections")
      .populate("facultyId", "name email employeeId")
      .sort({ dueDate: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Get Student Coursework Assignments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student assignments",
      error: error.message,
    });
  }
};

const submitCourseworkAssignment = async (req, res) => {
  try {
    console.log("UPLOADED FILE:", req.file);
    console.log("SUBMISSION BODY:", req.body);
    const { id } = req.params;
    const { text } = req.body;
    const uploadedFile = req.file;

    if ((!text || !text.trim()) && !uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Please enter submission text or attach a PDF",
      });
    }

    const student = await Student.findOne({
      _id: req.user.userId,
      tenantId: req.tenantId,
      isActive: true,
    }).select("name classId section");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const assignment = await CourseworkAssignment.findOne({
      _id: id,
      tenantId: req.tenantId,
      classId: student.classId,
      section: student.section,
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found for your class and section",
      });
    }

    const existingSubmission = assignment.submissions.find(
      (submission) =>
        submission.studentId.toString() === req.user.userId.toString(),
    );

    if (existingSubmission) {
      existingSubmission.text = text?.trim() || "";
      existingSubmission.status = "SUBMITTED";
      existingSubmission.submittedAt = new Date();
      existingSubmission.marks = null;
      existingSubmission.feedback = null;

      if (uploadedFile) {
        existingSubmission.file = {
          originalName: uploadedFile.originalname,
          fileName: uploadedFile.filename,
          fileUrl: `/uploads/assignments/${uploadedFile.filename}`,
          mimeType: uploadedFile.mimetype,
          size: uploadedFile.size,
        };
      }
    } else {
      assignment.submissions.push({
        studentId: req.user.userId,
        studentName: student.name,
        text: text?.trim() || "",
        status: "SUBMITTED",
        submittedAt: new Date(),
        marks: null,
        feedback: null,

        file: uploadedFile
          ? {
              originalName: uploadedFile.originalname,
              fileName: uploadedFile.filename,
              fileUrl: `/uploads/assignments/${uploadedFile.filename}`,
              mimeType: uploadedFile.mimetype,
              size: uploadedFile.size,
            }
          : null,
      });
    }

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully",
      assignment,
    });
  } catch (error) {
    console.error("Submit Coursework Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit assignment",
    });
  }
};

const getCourseworkAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await CourseworkAssignment.findOne({
      _id: id,
      tenantId: req.tenantId,
      facultyId: req.user.userId,
      isActive: true,
    })
      .populate("classId", "name sections")
      .populate("facultyId", "name email employeeId")
      .populate(
        "submissions.studentId",
        "name email admissionNumber rollNumber",
      );

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
    console.error("Get Coursework Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
      error: error.message,
    });
  }
};

const gradeCourseworkSubmission = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const { marks, feedback } = req.body;

    // Validate marks
    if (marks === undefined || marks === null || marks === "") {
      return res.status(400).json({
        success: false,
        message: "Marks are required",
      });
    }

    const numericMarks = Number(marks);

    if (!Number.isFinite(numericMarks) || numericMarks < 0) {
      return res.status(400).json({
        success: false,
        message: "Marks must be a valid non-negative number",
      });
    }

    // Find assignment owned by logged-in faculty
    const assignment = await CourseworkAssignment.findOne({
      _id: id,
      tenantId: req.tenantId,
      facultyId: req.user.userId,
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Marks cannot exceed maximum marks
    if (numericMarks > assignment.maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks cannot exceed maximum marks (${assignment.maxMarks})`,
      });
    }

    // Find student's submission
    const submission = assignment.submissions.find(
      (sub) => sub.studentId.toString() === studentId,
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Student submission not found",
      });
    }

    // Update grading details
    submission.marks = numericMarks;
    submission.feedback = feedback?.trim() || "";
    submission.status = "GRADED";

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      submission,
    });
  } catch (error) {
    console.error("Grade Coursework Submission Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to grade submission",
      error: error.message,
    });
  }
};

module.exports = {
  createCourseworkAssignment,
  getMyCourseworkAssignments,
  getStudentCourseworkAssignments,
  submitCourseworkAssignment,
  getCourseworkAssignmentById,
  gradeCourseworkSubmission,
};
