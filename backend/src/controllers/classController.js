const SchoolClass = require("../models/SchoolClass");
const Tenant = require("../models/Tenant");

const createClass = async (req, res) => {
  try {
    const { name, sections = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Class name is required",
      });
    }

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    // Verify school exists
    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Check duplicate class in same school
    const existingClass = await SchoolClass.findOne({
      tenantId: req.user.tenantId,
      name: name.trim(),
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: "This class already exists in your school",
      });
    }

    // Remove duplicate sections
    const uniqueSections = [
      ...new Set(
        sections.map((section) => section.trim().toUpperCase()).filter(Boolean),
      ),
    ];

    const schoolClass = await SchoolClass.create({
      name: name.trim(),
      sections: uniqueSections,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: schoolClass,
    });
  } catch (error) {
    console.error("Create class error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllClasses = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const classes = await SchoolClass.find({
      tenantId: req.user.tenantId,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    console.error("Get classes error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const schoolClass = await SchoolClass.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      class: schoolClass,
    });
  } catch (error) {
    console.error("Get class by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sections, isActive } = req.body;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const schoolClass = await SchoolClass.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Update class name
    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Class name cannot be empty",
        });
      }

      // Check duplicate class name in same school
      const existingClass = await SchoolClass.findOne({
        tenantId: req.user.tenantId,
        name: trimmedName,
        _id: { $ne: id },
      });

      if (existingClass) {
        return res.status(409).json({
          success: false,
          message: "This class already exists in your school",
        });
      }

      schoolClass.name = trimmedName;
    }

    // Update sections
    if (sections !== undefined) {
      if (!Array.isArray(sections)) {
        return res.status(400).json({
          success: false,
          message: "Sections must be an array",
        });
      }

      schoolClass.sections = [
        ...new Set(
          sections
            .map((section) => section.trim().toUpperCase())
            .filter(Boolean),
        ),
      ];
    }

    // Update active status
    if (isActive !== undefined) {
      schoolClass.isActive = isActive;
    }

    await schoolClass.save();

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
      class: schoolClass,
    });
  } catch (error) {
    console.error("Update class error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deactivateClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const schoolClass = await SchoolClass.findOne({
      _id: id,
      tenantId: req.user.tenantId,
    });

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    schoolClass.isActive = false;

    await schoolClass.save();

    return res.status(200).json({
      success: true,
      message: "Class deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate class error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const reactivateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const schoolClass = await SchoolClass.findOne({
      _id: id,
      tenantId,
    });

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    schoolClass.isActive = true;
    await schoolClass.save();

    return res.status(200).json({
      success: true,
      message: "Class reactivated successfully",
      class: schoolClass,
    });
  } catch (error) {
    console.error("Reactivate class error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deactivateClass,
  reactivateClass,
};
