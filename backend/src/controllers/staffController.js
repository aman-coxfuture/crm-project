const Staff = require("../models/Staff");

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find({
      tenantId: req.tenantId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error("Get Staff Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      error: error.message,
    });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, joiningDate } =
      req.body;

    if (!name || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: "Name, department and designation are required",
      });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    if (normalizedEmail) {
      const existingStaff = await Staff.findOne({
        tenantId: req.tenantId,
        email: normalizedEmail,
      });

      if (existingStaff) {
        return res.status(409).json({
          success: false,
          message: "Staff with this email already exists",
        });
      }
    }

    const staff = await Staff.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      department: department.trim(),
      designation: designation.trim(),
      salary: Number(salary) || 0,
      joiningDate: joiningDate || undefined,
      tenantId: req.tenantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      staff,
    });
  } catch (error) {
    console.error("Create Staff Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create staff",
      error: error.message,
    });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const { name, email, phone, department, designation, salary, joiningDate } =
      req.body;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingStaff = await Staff.findOne({
        tenantId: req.tenantId,
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingStaff) {
        return res.status(409).json({
          success: false,
          message: "Another staff member already uses this email",
        });
      }

      staff.email = normalizedEmail;
    }

    if (name !== undefined) staff.name = name.trim();
    if (phone !== undefined) staff.phone = phone?.trim() || null;
    if (department !== undefined) staff.department = department.trim();
    if (designation !== undefined) staff.designation = designation.trim();
    if (salary !== undefined) staff.salary = Number(salary) || 0;
    if (joiningDate !== undefined) staff.joiningDate = joiningDate || null;

    await staff.save();

    return res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      staff,
    });
  } catch (error) {
    console.error("Update Staff Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update staff",
      error: error.message,
    });
  }
};

const deactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findOneAndUpdate(
      {
        _id: id,
        tenantId: req.tenantId,
      },
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff member deactivated successfully",
      staff,
    });
  } catch (error) {
    console.error("Deactivate Staff Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate staff",
      error: error.message,
    });
  }
};

const reactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findOneAndUpdate(
      {
        _id: id,
        tenantId: req.tenantId,
      },
      {
        isActive: true,
      },
      {
        new: true,
      },
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff member reactivated successfully",
      staff,
    });
  } catch (error) {
    console.error("Reactivate Staff Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reactivate staff",
      error: error.message,
    });
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deactivateStaff,
  reactivateStaff,
};
