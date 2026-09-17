const FacultyAttendance = require("../models/FacultyAttendance");
const Faculty = require("../models/Faculty");

// GET faculty attendance
const getFacultyAttendance = async (req, res) => {
  try {
    const { date, facultyId } = req.query;

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

    if (facultyId) {
      filter.facultyId = facultyId;
    }

    const attendance = await FacultyAttendance.find(filter)
      .populate("facultyId", "name email employeeId department designation")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get Faculty Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty attendance",
      error: error.message,
    });
  }
};

// CREATE / UPDATE faculty attendance
const markFacultyAttendance = async (req, res) => {
  try {
    const { facultyId, date, status, checkInTime, checkOutTime, remarks } =
      req.body;

    if (!facultyId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "facultyId, date and status are required",
      });
    }

    const faculty = await Faculty.findOne({
      _id: facultyId,
      tenantId: req.tenantId,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const [year, month, day] = date.split("-").map(Number);

    const attendanceDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    const attendance = await FacultyAttendance.findOneAndUpdate(
      {
        tenantId: req.tenantId,
        facultyId,
        date: attendanceDate,
      },
      {
        $set: {
          status: status.toUpperCase(),
          checkInTime: checkInTime || null,
          checkOutTime: checkOutTime || null,
          remarks: remarks || null,
          markedBy: req.user?.userId || null,
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
      message: "Faculty attendance saved successfully",
      attendance,
    });
  } catch (error) {
    console.error("Mark Faculty Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save faculty attendance",
      error: error.message,
    });
  }
};

// UPDATE faculty attendance
const updateFacultyAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkInTime, checkOutTime, remarks } = req.body;

    const attendance = await FacultyAttendance.findOneAndUpdate(
      {
        _id: id,
        tenantId: req.tenantId,
      },
      {
        $set: {
          ...(status && { status: status.toUpperCase() }),
          ...(checkInTime !== undefined && { checkInTime }),
          ...(checkOutTime !== undefined && { checkOutTime }),
          ...(remarks !== undefined && { remarks }),
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
        message: "Faculty attendance record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Faculty attendance updated successfully",
      attendance,
    });
  } catch (error) {
    console.error("Update Faculty Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update faculty attendance",
      error: error.message,
    });
  }
};

module.exports = {
  getFacultyAttendance,
  markFacultyAttendance,
  updateFacultyAttendance,
};
