const Timetable = require("../models/Timetable");
const SchoolClass = require("../models/SchoolClass");
const Faculty = require("../models/Faculty");

// GET timetable
const getTimetable = async (req, res) => {
  try {
    const { day, classId, section, facultyId } = req.query;

    const filter = {
      tenantId: req.tenantId,
      isActive: true,
    };

    if (day) filter.day = day.toUpperCase();
    if (classId) filter.classId = classId;
    if (section) filter.section = section;
    if (facultyId) filter.facultyId = facultyId;

    const timetable = await Timetable.find(filter)
      .populate("classId", "name sections")
      .populate("facultyId", "name email employeeId department designation")
      .sort({ day: 1, period: 1 });

    return res.status(200).json({
      success: true,
      timetable,
    });
  } catch (error) {
    console.error("Get timetable error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
      error: error.message,
    });
  }
};

// CREATE timetable entry
const createTimetable = async (req, res) => {
  try {
    const {
      day,
      period,
      startTime,
      endTime,
      classId,
      section,
      facultyId,
      subject,
      room,
    } = req.body;

    if (
      !day ||
      !period ||
      !startTime ||
      !endTime ||
      !classId ||
      !section ||
      !facultyId ||
      !subject
    ) {
      return res.status(400).json({
        success: false,
        message: "All required timetable fields must be provided",
      });
    }

    // Verify class belongs to current tenant
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

    // Verify section exists in the class
    if (!schoolClass.sections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: "Section does not belong to selected class",
      });
    }

    // Verify faculty belongs to current tenant
    const faculty = await Faculty.findOne({
      _id: facultyId,
      tenantId: req.tenantId,
      isActive: true,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    // Check duplicate slot
    const existingEntry = await Timetable.findOne({
      tenantId: req.tenantId,
      day: day.toUpperCase(),
      period,
      classId,
      section,
      isActive: true,
    });

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message: "This period is already assigned for this class and section",
      });
    }

    const timetable = await Timetable.create({
      day: day.toUpperCase(),
      period,
      startTime,
      endTime,
      classId,
      section,
      facultyId,
      subject,
      room: room || null,
      tenantId: req.tenantId,
    });

    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate("classId", "name sections")
      .populate("facultyId", "name email employeeId department designation");

    return res.status(201).json({
      success: true,
      message: "Timetable entry created successfully",
      timetable: populatedTimetable,
    });
  } catch (error) {
    console.error("Create timetable error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This timetable slot already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create timetable entry",
      error: error.message,
    });
  }
};

// UPDATE timetable entry
const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      day,
      period,
      startTime,
      endTime,
      classId,
      section,
      facultyId,
      subject,
      room,
    } = req.body;

    const timetable = await Timetable.findOne({
      _id: id,
      tenantId: req.tenantId,
      isActive: true,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    if (classId) {
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

      if (section && !schoolClass.sections.includes(section)) {
        return res.status(400).json({
          success: false,
          message: "Section does not belong to selected class",
        });
      }
    }

    if (facultyId) {
      const faculty = await Faculty.findOne({
        _id: facultyId,
        tenantId: req.tenantId,
        isActive: true,
      });

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty member not found",
        });
      }
    }

    timetable.day = day ? day.toUpperCase() : timetable.day;
    timetable.period = period ?? timetable.period;
    timetable.startTime = startTime || timetable.startTime;
    timetable.endTime = endTime || timetable.endTime;
    timetable.classId = classId || timetable.classId;
    timetable.section = section || timetable.section;
    timetable.facultyId = facultyId || timetable.facultyId;
    timetable.subject = subject || timetable.subject;
    timetable.room = room ?? timetable.room;

    await timetable.save();

    const updatedTimetable = await Timetable.findById(timetable._id)
      .populate("classId", "name sections")
      .populate("facultyId", "name email employeeId department designation");

    return res.status(200).json({
      success: true,
      message: "Timetable entry updated successfully",
      timetable: updatedTimetable,
    });
  } catch (error) {
    console.error("Update timetable error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This timetable slot already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update timetable entry",
      error: error.message,
    });
  }
};

// DEACTIVATE timetable entry
const deactivateTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findOneAndUpdate(
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

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Timetable entry deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate timetable error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate timetable entry",
      error: error.message,
    });
  }
};

// REACTIVATE timetable entry
const reactivateTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findOneAndUpdate(
      {
        _id: id,
        tenantId: req.tenantId,
        isActive: false,
      },
      {
        isActive: true,
      },
      { new: true },
    );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Timetable entry reactivated successfully",
    });
  } catch (error) {
    console.error("Reactivate timetable error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reactivate timetable entry",
      error: error.message,
    });
  }
};

module.exports = {
  getTimetable,
  createTimetable,
  updateTimetable,
  deactivateTimetable,
  reactivateTimetable,
};
