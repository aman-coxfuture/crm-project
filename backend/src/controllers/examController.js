const Exam = require("../models/Exam");
const SchoolClass = require("../models/SchoolClass");

// =====================================================
// GET ALL EXAMINATIONS
// =====================================================

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      tenantId: req.tenantId,
      isActive: true,
    })
      .populate("classesIncluded.classId", "name sections")
      .sort({ startDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      exams,
    });
  } catch (error) {
    console.error("Get exams error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch examinations",
    });
  }
};

// =====================================================
// GET SINGLE EXAMINATION
// =====================================================

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      isActive: true,
    }).populate("classesIncluded.classId", "name sections");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    console.error("Get exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch examination",
    });
  }
};

// =====================================================
// CREATE EXAMINATION
// =====================================================

const createExam = async (req, res) => {
  try {
    const {
      name,
      term,
      academicYear,
      startDate,
      endDate,
      classesIncluded,
      schedule,
      status,
    } = req.body;

    // =====================================================
    // BASIC VALIDATION
    // =====================================================

    if (!name || !term || !academicYear || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Name, term, academic year, start date and end date are required",
      });
    }

    // =====================================================
    // DATE RANGE VALIDATION
    // =====================================================

    const examStartDate = new Date(startDate);
    const examEndDate = new Date(endDate);

    if (
      Number.isNaN(examStartDate.getTime()) ||
      Number.isNaN(examEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid examination dates",
      });
    }

    if (examStartDate > examEndDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // =====================================================
    // CLASS VALIDATION
    // =====================================================

    const validatedClasses = [];

    if (classesIncluded && Array.isArray(classesIncluded)) {
      for (const item of classesIncluded) {
        if (!item.classId) {
          return res.status(400).json({
            success: false,
            message: "Each participating class must have a classId",
          });
        }

        const schoolClass = await SchoolClass.findOne({
          _id: item.classId,
          tenantId: req.tenantId,
          isActive: true,
        });

        if (!schoolClass) {
          return res.status(404).json({
            success: false,
            message: "One of the selected classes was not found",
          });
        }

        const sections = Array.isArray(item.sections) ? item.sections : [];

        // Validate sections
        for (const section of sections) {
          if (!schoolClass.sections.includes(section)) {
            return res.status(400).json({
              success: false,
              message: `Section ${section} does not exist in class ${schoolClass.name}`,
            });
          }
        }

        validatedClasses.push({
          classId: schoolClass._id,
          className: schoolClass.name,
          sections,
        });
      }
    }

    // =====================================================
    // SCHEDULE VALIDATION
    // =====================================================

    const validatedSchedule = [];

    if (schedule && Array.isArray(schedule)) {
      const scheduleKeys = new Set();

      for (const item of schedule) {
        if (
          !item.date ||
          !item.subject ||
          !item.startTime ||
          !item.endTime ||
          item.maxMarks === undefined ||
          item.passMarks === undefined
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Each schedule entry requires date, subject, start time, end time, max marks and pass marks",
          });
        }

        const scheduleDate = new Date(item.date);

        if (Number.isNaN(scheduleDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: `Invalid exam date for subject ${item.subject}`,
          });
        }

        // Schedule date must fall within exam period
        if (scheduleDate < examStartDate || scheduleDate > examEndDate) {
          return res.status(400).json({
            success: false,
            message: `${item.subject} exam date must be within the examination period`,
          });
        }

        const maxMarks = Number(item.maxMarks);
        const passMarks = Number(item.passMarks);

        if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid maximum marks for ${item.subject}`,
          });
        }

        if (!Number.isFinite(passMarks) || passMarks < 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid pass marks for ${item.subject}`,
          });
        }

        if (passMarks > maxMarks) {
          return res.status(400).json({
            success: false,
            message: `Pass marks cannot be greater than maximum marks for ${item.subject}`,
          });
        }

        // Prevent duplicate subject on same date
        const dateKey = scheduleDate.toISOString().split("T")[0];

        const scheduleKey = `${dateKey}-${item.subject.trim().toLowerCase()}`;

        if (scheduleKeys.has(scheduleKey)) {
          return res.status(400).json({
            success: false,
            message: `Duplicate schedule found for ${item.subject} on ${dateKey}`,
          });
        }

        scheduleKeys.add(scheduleKey);

        validatedSchedule.push({
          date: scheduleDate,
          subject: item.subject.trim(),
          startTime: item.startTime,
          endTime: item.endTime,
          maxMarks,
          passMarks,
          room: item.room?.trim() || null,
        });
      }
    }

    // =====================================================
    // CREATE EXAMINATION
    // =====================================================

    const exam = await Exam.create({
      name: name.trim(),
      term: term.trim(),
      academicYear: academicYear.trim(),
      startDate: examStartDate,
      endDate: examEndDate,
      classesIncluded: validatedClasses,
      schedule: validatedSchedule,
      status: status || "DRAFT",
      tenantId: req.tenantId,
    });

    // Populate class details
    const populatedExam = await Exam.findById(exam._id).populate(
      "classesIncluded.classId",
      "name sections",
    );

    res.status(201).json({
      success: true,
      message: "Examination created successfully",
      exam: populatedExam,
    });
  } catch (error) {
    console.error("Create exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create examination",
    });
  }
};

// =====================================================
// UPDATE EXAMINATION
// =====================================================

const updateExam = async (req, res) => {
  try {
    const {
      name,
      term,
      academicYear,
      startDate,
      endDate,
      classesIncluded,
      schedule,
      status,
    } = req.body;

    const exam = await Exam.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    if (name !== undefined) exam.name = name;
    if (term !== undefined) exam.term = term;
    if (academicYear !== undefined) exam.academicYear = academicYear;
    if (startDate !== undefined) exam.startDate = startDate;
    if (endDate !== undefined) exam.endDate = endDate;
    if (classesIncluded !== undefined) exam.classesIncluded = classesIncluded;
    if (schedule !== undefined) exam.schedule = schedule;
    if (status !== undefined) exam.status = status;

    await exam.save();

    const updatedExam = await Exam.findById(exam._id).populate(
      "classesIncluded.classId",
      "name sections",
    );

    res.status(200).json({
      success: true,
      message: "Examination updated successfully",
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Update exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update examination",
    });
  }
};

// =====================================================
// DEACTIVATE EXAMINATION
// =====================================================

const deactivateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.tenantId,
        isActive: true,
      },
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Examination deactivated successfully",
      exam,
    });
  } catch (error) {
    console.error("Deactivate exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to deactivate examination",
    });
  }
};

// =====================================================
// REACTIVATE EXAMINATION
// =====================================================

const reactivateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.tenantId,
        isActive: false,
      },
      {
        isActive: true,
      },
      {
        new: true,
      },
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Inactive examination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Examination reactivated successfully",
      exam,
    });
  } catch (error) {
    console.error("Reactivate exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reactivate examination",
    });
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deactivateExam,
  reactivateExam,
};
