const Notice = require("../models/Notice");

// Get notices for current tenant
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({
      tenantId: req.tenantId,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notices,
    });
  } catch (error) {
    console.error("Get notices error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
    });
  }
};
// Get notices for current student
const getStudentNotices = async (req, res) => {
  try {
    const notices = await Notice.find({
      tenantId: req.tenantId,
      isActive: true,
      audience: { $in: ["All", "Students"] },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notices,
    });
  } catch (error) {
    console.error("Get student notices error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student notices",
    });
  }
};

// Create notice
const createNotice = async (req, res) => {
  try {
    const { title, content, audience, priority, author } = req.body;

    if (!title || !content || !audience || !author) {
      return res.status(400).json({
        success: false,
        message: "Title, content, audience and author are required",
      });
    }

    const notice = await Notice.create({
      title,
      content,
      audience,
      priority: priority || "Medium",
      author,
      tenantId: req.tenantId,
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    console.error("Create notice error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notice",
    });
  }
};

module.exports = {
  getNotices,
  getStudentNotices,
  createNotice,
};
