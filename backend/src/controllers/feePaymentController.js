const Fee = require("../models/Fee");
const FeePayment = require("../models/FeePayment");
const Student = require("../models/Student");

const generateReceiptNo = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `REC-${timestamp}-${random}`;
};

// Record Fee Payment
const createFeePayment = async (req, res) => {
  try {
    const {
      studentId,
      feeId,
      feeType,
      amount,
      paymentMethod,
      paymentDate,
      notes,
    } = req.body;

    if (
      !studentId ||
      !feeId ||
      !feeType ||
      amount === undefined ||
      !paymentMethod ||
      !paymentDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Required payment details are missing",
      });
    }

    if (!req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
    }

    // Verify student belongs to the same school
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

    // Find fee record within same tenant
    const fee = await Fee.findOne({
      _id: feeId,
      studentId,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    // Do not allow payment greater than outstanding amount
    const outstandingAmount =
      Number(fee.totalAmount) -
      Number(fee.paidAmount) +
      Number(fee.fineAmount || 0);

    if (paymentAmount > outstandingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount cannot exceed outstanding amount of ₹${outstandingAmount}`,
      });
    }

    const receiptNo = generateReceiptNo();

    // Create payment transaction
    const payment = await FeePayment.create({
      studentId,
      feeId,
      tenantId: req.user.tenantId,
      receiptNo,
      feeType,
      amount: paymentAmount,
      paymentMethod,
      paymentDate,
      notes: notes || null,
      status: "SUCCESS",
    });

    // Update fee ledger
    fee.paidAmount = Number(fee.paidAmount || 0) + paymentAmount;

    fee.pendingAmount =
      Number(fee.totalAmount) -
      Number(fee.paidAmount) +
      Number(fee.fineAmount || 0);

    if (fee.pendingAmount <= 0) {
      fee.pendingAmount = 0;
      fee.status = "PAID";
    } else if (fee.dueDate && new Date(fee.dueDate) < new Date()) {
      fee.status = "OVERDUE";
    } else {
      fee.status = "PARTIAL";
    }

    await fee.save();

    return res.status(201).json({
      success: true,
      message: "Fee payment recorded successfully",
      payment,
      fee,
    });
  } catch (error) {
    console.error("Create Fee Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record fee payment",
      error: error.message,
    });
  }
};

// Get All Payment History
const getAllFeePayments = async (req, res) => {
  try {
    const payments = await FeePayment.find({
      tenantId: req.user.tenantId,
      status: "SUCCESS",
    })
      .populate("studentId", "name email admissionNumber")
      .populate("feeId", "academicSession className section")
      .sort({ paymentDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get Fee Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

// Get Payments By Student
const getStudentFeePayments = async (req, res) => {
  try {
    const payments = await FeePayment.find({
      studentId: req.params.studentId,
      tenantId: req.user.tenantId,
      status: "SUCCESS",
    })
      .populate("feeId", "academicSession className section")
      .sort({ paymentDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get Student Fee Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student payment history",
      error: error.message,
    });
  }
};

module.exports = {
  createFeePayment,
  getAllFeePayments,
  getStudentFeePayments,
};
