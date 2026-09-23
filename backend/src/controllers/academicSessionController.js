const AcademicSession = require("../models/AcademicSession");

// Get all academic sessions
const getAcademicSessions = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const sessions = await AcademicSession.find({
      tenantId: req.user.tenantId,
    }).sort({ startDate: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Get Academic Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch academic sessions",
      error: error.message,
    });
  }
};

// Get active academic sessions
const getActiveAcademicSessions = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const sessions = await AcademicSession.find({
      tenantId: req.user.tenantId,
      isActive: true,
    }).sort({ startDate: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Get Active Academic Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active academic sessions",
      error: error.message,
    });
  }
};

// Create academic session
const createAcademicSession = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Session name, start date and end date are required",
      });
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Session name cannot be empty",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or end date",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    const existingSession = await AcademicSession.findOne({
      tenantId: req.user.tenantId,
      name: trimmedName,
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: "This academic session already exists",
      });
    }

    const session = await AcademicSession.create({
      name: trimmedName,
      startDate: start,
      endDate: end,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Academic session created successfully",
      session,
    });
  } catch (error) {
    console.error("Create Academic Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create academic session",
      error: error.message,
    });
  }
};

// Update academic session
const updateAcademicSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, isActive } = req.body;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const session = await AcademicSession.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Academic session not found",
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Session name cannot be empty",
        });
      }

      const duplicateSession = await AcademicSession.findOne({
        tenantId: req.user.tenantId,
        name: trimmedName,
        _id: { $ne: id },
      });

      if (duplicateSession) {
        return res.status(409).json({
          success: false,
          message: "This academic session already exists",
        });
      }

      session.name = trimmedName;
    }

    if (startDate !== undefined) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }

      session.startDate = start;
    }

    if (endDate !== undefined) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date",
        });
      }

      session.endDate = end;
    }

    if (session.startDate >= session.endDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    if (isActive !== undefined) {
      session.isActive = isActive;
    }

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Academic session updated successfully",
      session,
    });
  } catch (error) {
    console.error("Update Academic Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update academic session",
      error: error.message,
    });
  }
};

// Deactivate academic session
const deactivateAcademicSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const session = await AcademicSession.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Academic session not found",
      });
    }

    session.isActive = false;

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Academic session deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate Academic Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate academic session",
      error: error.message,
    });
  }
};

module.exports = {
  getAcademicSessions,
  getActiveAcademicSessions,
  createAcademicSession,
  updateAcademicSession,
  deactivateAcademicSession,
};
