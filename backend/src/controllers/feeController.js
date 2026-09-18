const Fee = require("../models/Fee");
const Student = require("../models/Student");

// Create Fee
const createFee = async (req, res) => {
  try {
    const {
      studentId,
      academicSession,
      className,
      section,
      feeHeads,
      totalAmount,
      dueDate,
    } = req.body;

    if (
      !studentId ||
      !academicSession ||
      !className ||
      !section ||
      !feeHeads ||
      totalAmount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fee details are missing",
      });
    }

    if (!req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    const student = await Student.findOne({
      _id: studentId,
      tenantId: req.user.tenantId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const existingFee = await Fee.findOne({
      studentId,
      tenantId: req.user.tenantId,
      academicSession,
      isActive: true,
    });

    if (existingFee) {
      return res.status(409).json({
        success: false,
        message: "Fee record already exists for this student and session",
      });
    }

    const fee = await Fee.create({
      studentId,
      tenantId: req.user.tenantId,
      academicSession,
      className,
      section,
      feeHeads,
      totalAmount,
      paidAmount: 0,
      pendingAmount: totalAmount,
      fineAmount: 0,
      dueDate: dueDate || null,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Fee record created successfully",
      fee,
    });
  } catch (error) {
    console.error("Create Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create fee record",
      error: error.message,
    });
  }
};

// Get All Fees
const getAllFees = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    const fees = await Fee.find({
      tenantId: req.user.tenantId,
      isActive: true,
    })
      .populate("studentId", "name email admissionNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: fees.length,
      fees,
    });
  } catch (error) {
    console.error("Get Fees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee records",
      error: error.message,
    });
  }
};

// Get Fee By ID
const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      isActive: true,
    }).populate("studentId", "name email admissionNumber");

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    return res.status(200).json({
      success: true,
      fee,
    });
  } catch (error) {
    console.error("Get Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee record",
      error: error.message,
    });
  }
};

// Get Fees By Student
const getStudentFees = async (req, res) => {
  try {
    const fees = await Fee.find({
      studentId: req.params.studentId,
      tenantId: req.user.tenantId,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: fees.length,
      fees,
    });
  } catch (error) {
    console.error("Get Student Fees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student fees",
      error: error.message,
    });
  }
};

// Update Fee
const updateFee = async (req, res) => {
  try {
    const fee = await Fee.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const allowedFields = [
      "academicSession",
      "className",
      "section",
      "feeHeads",
      "totalAmount",
      "dueDate",
      "fineAmount",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        fee[field] = req.body[field];
      }
    });

    fee.pendingAmount =
      Number(fee.totalAmount) -
      Number(fee.paidAmount) +
      Number(fee.fineAmount || 0);

    if (fee.pendingAmount <= 0) {
      fee.pendingAmount = 0;
      fee.status = "PAID";
    } else if (fee.dueDate && new Date(fee.dueDate) < new Date()) {
      fee.status = "OVERDUE";
    } else if (fee.paidAmount > 0) {
      fee.status = "PARTIAL";
    } else {
      fee.status = "PENDING";
    }

    await fee.save();

    return res.status(200).json({
      success: true,
      message: "Fee record updated successfully",
      fee,
    });
  } catch (error) {
    console.error("Update Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update fee record",
      error: error.message,
    });
  }
};

// Deactivate Fee
const deactivateFee = async (req, res) => {
  try {
    const fee = await Fee.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId,
      },
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fee record deactivated successfully",
      fee,
    });
  } catch (error) {
    console.error("Deactivate Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate fee record",
      error: error.message,
    });
  }
};

module.exports = {
  createFee,
  getAllFees,
  getFeeById,
  getStudentFees,
  updateFee,
  deactivateFee,
};
