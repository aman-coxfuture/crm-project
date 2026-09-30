const StudentAttendance = require("../models/StudentAttendance");
const Student = require("../models/Student");
const SchoolClass = require("../models/SchoolClass");

const getStudentAttendance = async (req, res) => {
  try {
    const { date, classId, section, studentId } = req.query;

    const filter = {
      tenantId: req.tenantId,
    };

    if (date) {
      const [year, month, day] = date.split("-").map(Number);

      const start = new Date(year, month - 1, day, 0, 0, 0, 0);
      const end = new Date(year, month - 1, day, 23, 59, 59, 999);

      filter.date = {
        $gte: start,
        $lte: end,
      };
    }

    if (classId) filter.classId = classId;
    if (section) filter.section = section;

    if (req.user.role === "STUDENT") {
      filter.studentId = req.user.userId;
    } else if (studentId) {
      filter.studentId = studentId;
    }

    const attendance = await StudentAttendance.find(filter)
      .populate("studentId", "name email admissionNumber rollNumber")
      .populate("classId", "name sections")
      .populate("markedBy", "name email employeeId")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get Student Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
      error: error.message,
    });
  }
};

const markStudentAttendance = async (req, res) => {
  try {
    const { studentId, classId, section, date, status } = req.body;

    if (!studentId || !classId || !section || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "studentId, classId, section, date and status are required",
      });
    }

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

    const classSection = schoolClass.sections?.find(
      (item) => (typeof item === "string" ? item : item.name) === section,
    );

    if (!classSection) {
      return res.status(400).json({
        success: false,
        message: "Section does not belong to this class",
      });
    }

    const [year, month, day] = date.split("-").map(Number);

    const attendanceDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    const attendance = await StudentAttendance.findOneAndUpdate(
      {
        tenantId: req.tenantId,
        studentId,
        date: attendanceDate,
      },
      {
        $set: {
          classId,
          section,
          status: status.toUpperCase(),
          markedBy: req.user.userId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Student attendance saved successfully",
      attendance,
    });
  } catch (error) {
    console.error("Mark Student Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save student attendance",
      error: error.message,
    });
  }
};

const updateStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const attendance = await StudentAttendance.findOneAndUpdate(
      {
        _id: id,
        tenantId: req.tenantId,
      },
      {
        $set: {
          status: status.toUpperCase(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Student attendance record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student attendance updated successfully",
      attendance,
    });
  } catch (error) {
    console.error("Update Student Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student attendance",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentAttendance,
  markStudentAttendance,
  updateStudentAttendance,
};
