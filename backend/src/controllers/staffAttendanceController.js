const StaffAttendance = require("../models/StaffAttendance");
const Staff = require("../models/Staff");

// GET staff attendance
const getStaffAttendance = async (req, res) => {
  try {
    const { date, staffId } = req.query;

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

    if (staffId) {
      filter.staffId = staffId;
    }

    const attendance = await StaffAttendance.find(filter)
      .populate("staffId", "name email phone department designation")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get Staff Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff attendance",
      error: error.message,
    });
  }
};

// CREATE / UPDATE staff attendance
const markStaffAttendance = async (req, res) => {
  try {
    const { staffId, date, status, checkInTime, checkOutTime, remarks } =
      req.body;

    if (!staffId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "staffId, date and status are required",
      });
    }

    const staff = await Staff.findOne({
      _id: staffId,
      tenantId: req.tenantId,
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await StaffAttendance.findOneAndUpdate(
      {
        tenantId: req.tenantId,
        staffId,
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
      message: "Staff attendance saved successfully",
      attendance,
    });
  } catch (error) {
    console.error("Mark Staff Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save staff attendance",
      error: error.message,
    });
  }
};

// UPDATE staff attendance
const updateStaffAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkInTime, checkOutTime, remarks } = req.body;

    const attendance = await StaffAttendance.findOneAndUpdate(
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
        message: "Staff attendance record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff attendance updated successfully",
      attendance,
    });
  } catch (error) {
    console.error("Update Staff Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update staff attendance",
      error: error.message,
    });
  }
};

module.exports = {
  getStaffAttendance,
  markStaffAttendance,
  updateStaffAttendance,
};
