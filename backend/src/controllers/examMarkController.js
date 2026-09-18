const mongoose = require("mongoose");
const ExamMark = require("../models/ExamMark");
const Exam = require("../models/Exam");
const Student = require("../models/Student");

// GET ALL MARKS
const getExamMarks = async (req, res) => {
  try {
    const { examId, studentId, subject } = req.query;

    const filter = {
      tenantId: req.tenantId,
      isActive: true,
    };

    if (examId) filter.examId = examId;
    if (studentId) filter.studentId = studentId;
    if (subject) filter.subject = subject;

    const marks = await ExamMark.find(filter)
      .populate("studentId", "name email admissionNumber className section")
      .populate("examId", "name term academicYear")
      .sort({ subject: 1 });

    res.json({
      success: true,
      count: marks.length,
      marks,
    });
  } catch (error) {
    console.error("Get exam marks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch exam marks",
    });
  }
};

// GET MARKS BY ID
const getExamMarkById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid marks ID",
      });
    }

    const mark = await ExamMark.findOne({
      _id: id,
      tenantId: req.tenantId,
      isActive: true,
    })
      .populate("studentId", "name email admissionNumber className section")
      .populate("examId", "name term academicYear");

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "Exam marks not found",
      });
    }

    res.json({
      success: true,
      mark,
    });
  } catch (error) {
    console.error("Get exam mark error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch exam marks",
    });
  }
};

// CREATE MARKS
const createExamMark = async (req, res) => {
  try {
    const {
      examId,
      studentId,
      subject,
      maxMarks,
      marksObtained,
      grade,
      remarks,
    } = req.body;

    if (!examId || !studentId || !subject) {
      return res.status(400).json({
        success: false,
        message: "Exam, student and subject are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(examId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam or student ID",
      });
    }

    // Check exam
    const exam = await Exam.findOne({
      _id: examId,
      tenantId: req.tenantId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    // Check student
    const student = await Student.findOne({
      _id: studentId,
      tenantId: req.tenantId,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const max = Number(maxMarks);
    const obtained = Number(marksObtained);

    if (!Number.isFinite(max) || max <= 0) {
      return res.status(400).json({
        success: false,
        message: "Maximum marks must be greater than 0",
      });
    }

    if (!Number.isFinite(obtained) || obtained < 0) {
      return res.status(400).json({
        success: false,
        message: "Marks obtained cannot be negative",
      });
    }

    if (obtained > max) {
      return res.status(400).json({
        success: false,
        message: "Marks obtained cannot exceed maximum marks",
      });
    }

    const existingMark = await ExamMark.findOne({
      examId,
      studentId,
      subject: subject.trim(),
      tenantId: req.tenantId,
    });

    if (existingMark) {
      return res.status(409).json({
        success: false,
        message: `Marks already entered for ${subject}`,
      });
    }

    const mark = await ExamMark.create({
      examId,
      studentId,
      subject: subject.trim(),
      maxMarks: max,
      marksObtained: obtained,
      grade: grade || null,
      remarks: remarks || null,
      tenantId: req.tenantId,
    });

    const populatedMark = await ExamMark.findById(mark._id)
      .populate("studentId", "name email admissionNumber className section")
      .populate("examId", "name term academicYear");

    res.status(201).json({
      success: true,
      message: "Exam marks added successfully",
      mark: populatedMark,
    });
  } catch (error) {
    console.error("Create exam mark error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add exam marks",
    });
  }
};

// UPDATE MARKS
const updateExamMark = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid marks ID",
      });
    }

    const mark = await ExamMark.findOne({
      _id: id,
      tenantId: req.tenantId,
      isActive: true,
    });

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "Exam marks not found",
      });
    }

    const { maxMarks, marksObtained, grade, remarks } = req.body;

    const max = maxMarks !== undefined ? Number(maxMarks) : mark.maxMarks;

    const obtained =
      marksObtained !== undefined ? Number(marksObtained) : mark.marksObtained;

    if (!Number.isFinite(max) || max <= 0) {
      return res.status(400).json({
        success: false,
        message: "Maximum marks must be greater than 0",
      });
    }

    if (!Number.isFinite(obtained) || obtained < 0) {
      return res.status(400).json({
        success: false,
        message: "Marks obtained cannot be negative",
      });
    }

    if (obtained > max) {
      return res.status(400).json({
        success: false,
        message: "Marks obtained cannot exceed maximum marks",
      });
    }

    mark.maxMarks = max;
    mark.marksObtained = obtained;

    if (grade !== undefined) {
      mark.grade = grade || null;
    }

    if (remarks !== undefined) {
      mark.remarks = remarks || null;
    }

    await mark.save();

    const updatedMark = await ExamMark.findById(mark._id)
      .populate("studentId", "name email admissionNumber className section")
      .populate("examId", "name term academicYear");

    res.json({
      success: true,
      message: "Exam marks updated successfully",
      mark: updatedMark,
    });
  } catch (error) {
    console.error("Update exam mark error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update exam marks",
    });
  }
};

// DELETE / DEACTIVATE MARKS
const deactivateExamMark = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid marks ID",
      });
    }

    const mark = await ExamMark.findOneAndUpdate(
      {
        _id: id,
        tenantId: req.tenantId,
        isActive: true,
      },
      {
        isActive: false,
      },
      { new: true },
    );

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "Exam marks not found",
      });
    }

    res.json({
      success: true,
      message: "Exam marks removed successfully",
    });
  } catch (error) {
    console.error("Deactivate exam mark error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove exam marks",
    });
  }
};

// GET STUDENT RESULT
const getStudentResult = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(examId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam or student ID",
      });
    }

    const marks = await ExamMark.find({
      examId,
      studentId,
      tenantId: req.tenantId,
      isActive: true,
    })
      .populate("studentId", "name email admissionNumber className section")
      .populate("examId", "name term academicYear")
      .sort({ subject: 1 });

    if (!marks.length) {
      return res.status(404).json({
        success: false,
        message: "No marks found for this student",
      });
    }

    let totalMarks = 0;
    let totalMaxMarks = 0;

    const subjects = marks.map((mark) => {
      totalMarks += mark.marksObtained;
      totalMaxMarks += mark.maxMarks;

      return {
        subject: mark.subject,
        maxMarks: mark.maxMarks,
        marksObtained: mark.marksObtained,
        grade: mark.grade,
        remarks: mark.remarks,
      };
    });

    const percentage =
      totalMaxMarks > 0
        ? Number(((totalMarks / totalMaxMarks) * 100).toFixed(2))
        : 0;

    let grade;

    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";
    else grade = "F";

    const result = percentage >= 40 ? "PASS" : "FAIL";

    res.json({
      success: true,
      student: marks[0].studentId,
      exam: marks[0].examId,
      subjects,
      totalMarks,
      totalMaxMarks,
      percentage,
      grade,
      result,
    });
  } catch (error) {
    console.error("Get student result error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate student result",
    });
  }
};

module.exports = {
  getExamMarks,
  getExamMarkById,
  createExamMark,
  updateExamMark,
  deactivateExamMark,
  getStudentResult,
};
