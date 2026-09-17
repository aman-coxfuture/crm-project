const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const getAttendance = async (req, res) => {
  try {
    const { date, studentId } = req.query;

    const filter = {
      tenantId: req.tenantId,
    };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: start,
        $lte: end,
      };
    }

    if (studentId) {
      filter.studentId = studentId;
    }

    const attendance = await Attendance.find(filter)
      .populate("studentId", "name admissionNumber classId section")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status, checkInTime, checkOutTime, remarks } =
      req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "Student, date and status are required",
      });
    }

    const student = await Student.findOne({
      _id: studentId,
      tenantId: req.tenantId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
        tenantId: req.tenantId,
        studentId,
        date: attendanceDate,
      },
      {
        tenantId: req.tenantId,
        studentId,
        date: attendanceDate,
        status,
        checkInTime: checkInTime || null,
        checkOutTime: checkOutTime || null,
        remarks: remarks || null,
        markedBy: req.user?.userId || null,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.error("Mark Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    const { status, checkInTime, checkOutTime, remarks } = req.body;

    if (status !== undefined) attendance.status = status;
    if (checkInTime !== undefined) {
      attendance.checkInTime = checkInTime || null;
    }
    if (checkOutTime !== undefined) {
      attendance.checkOutTime = checkOutTime || null;
    }
    if (remarks !== undefined) {
      attendance.remarks = remarks || null;
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    console.error("Update Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

const getStudentAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({
      _id: studentId,
      tenantId: req.tenantId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const records = await Attendance.find({
      tenantId: req.tenantId,
      studentId,
    }).sort({ date: -1 });

    const total = records.length;

    const present = records.filter((item) => item.status === "PRESENT").length;

    const absent = records.filter((item) => item.status === "ABSENT").length;

    const late = records.filter((item) => item.status === "LATE").length;

    const halfDay = records.filter((item) => item.status === "HALF_DAY").length;

    const percentage =
      total > 0
        ? Number((((present + late + halfDay * 0.5) / total) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      summary: {
        total,
        present,
        absent,
        late,
        halfDay,
        percentage,
      },
      attendance: records,
    });
  } catch (error) {
    console.error("Attendance Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance summary",
      error: error.message,
    });
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  updateAttendance,
  getStudentAttendanceSummary,
};
