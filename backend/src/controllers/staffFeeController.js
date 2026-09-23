const StaffFee = require("../models/StaffFee");
const StaffFeePayment = require("../models/StaffFeePayment");
const Faculty = require("../models/Faculty");
const Staff = require("../models/Staff");

// =====================================================
// CREATE STAFF FEE / MONTHLY SALARY LEDGER
// =====================================================

const createStaffFee = async (req, res) => {
  try {
    const {
      employeeId,
      employeeType,
      employeeName,
      department,
      designation,
      phone,
      email,
      monthlySalary,
      academicSession,
      paymentMonth,
      notes,
    } = req.body;

    if (
      !employeeId ||
      !employeeType ||
      !employeeName ||
      monthlySalary === undefined ||
      !academicSession ||
      !paymentMonth
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID, employee type, employee name, salary, academic session and payment month are required",
      });
    }

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const salary = Number(monthlySalary);

    if (Number.isNaN(salary) || salary < 0) {
      return res.status(400).json({
        success: false,
        message: "Monthly salary must be a valid non-negative number",
      });
    }

    // Prevent duplicate monthly ledger
    const existingLedger = await StaffFee.findOne({
      tenantId: req.user.tenantId,
      employeeId: employeeId.trim(),
      academicSession: academicSession.trim(),
      paymentMonth: paymentMonth.trim(),
      isActive: true,
    });

    if (existingLedger) {
      return res.status(409).json({
        success: false,
        message: "Salary ledger already exists for this employee and month",
      });
    }

    const staffFee = await StaffFee.create({
      employeeId: employeeId.trim(),
      employeeType,
      employeeName: employeeName.trim(),
      department: department?.trim() || null,
      designation: designation?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim().toLowerCase() || null,
      monthlySalary: salary,
      academicSession: academicSession.trim(),
      paymentMonth: paymentMonth.trim(),
      paidAmount: 0,
      pendingAmount: salary,
      paymentDate: null,
      paymentMethod: null,
      transactionId: null,
      status: salary === 0 ? "PAID" : "PENDING",
      notes: notes?.trim() || null,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Staff salary ledger created successfully",
      staffFee,
    });
  } catch (error) {
    console.error("Create Staff Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create staff salary ledger",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL STAFF FEE LEDGERS
// =====================================================

const getAllStaffFees = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const { academicSession, paymentMonth, employeeType, status, employeeId } =
      req.query;

    const query = {
      tenantId: req.user.tenantId,
      isActive: true,
    };

    if (academicSession) {
      query.academicSession = academicSession;
    }

    if (paymentMonth) {
      query.paymentMonth = paymentMonth;
    }

    if (employeeType && employeeType !== "All") {
      query.employeeType = employeeType;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    const staffFees = await StaffFee.find(query).sort({
      employeeName: 1,
    });

    return res.status(200).json({
      success: true,
      count: staffFees.length,
      staffFees,
    });
  } catch (error) {
    console.error("Get All Staff Fees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff fee records",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE STAFF FEE
// =====================================================

const getStaffFeeById = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const staffFee = await StaffFee.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    if (!staffFee) {
      return res.status(404).json({
        success: false,
        message: "Staff fee record not found",
      });
    }

    return res.status(200).json({
      success: true,
      staffFee,
    });
  } catch (error) {
    console.error("Get Staff Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff fee record",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE STAFF FEE LEDGER
// =====================================================

const updateStaffFee = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const staffFee = await StaffFee.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    if (!staffFee) {
      return res.status(404).json({
        success: false,
        message: "Staff fee record not found",
      });
    }

    const allowedFields = [
      "employeeName",
      "employeeType",
      "department",
      "designation",
      "phone",
      "email",
      "monthlySalary",
      "academicSession",
      "paymentMonth",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        staffFee[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    if (req.body.email !== undefined) {
      staffFee.email = req.body.email
        ? req.body.email.trim().toLowerCase()
        : null;
    }

    if (req.body.monthlySalary !== undefined) {
      const salary = Number(req.body.monthlySalary);

      if (Number.isNaN(salary) || salary < 0) {
        return res.status(400).json({
          success: false,
          message: "Monthly salary must be a valid non-negative number",
        });
      }

      staffFee.monthlySalary = salary;
    }

    // Recalculate pending amount after salary update
    staffFee.pendingAmount =
      Number(staffFee.monthlySalary) - Number(staffFee.paidAmount);

    if (staffFee.pendingAmount < 0) {
      staffFee.pendingAmount = 0;
    }

    if (staffFee.pendingAmount === 0) {
      staffFee.status = "PAID";
    } else if (Number(staffFee.paidAmount) > 0) {
      staffFee.status = "PARTIAL";
    } else {
      staffFee.status = "PENDING";
    }

    await staffFee.save();

    return res.status(200).json({
      success: true,
      message: "Staff fee record updated successfully",
      staffFee,
    });
  } catch (error) {
    console.error("Update Staff Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update staff fee record",
      error: error.message,
    });
  }
};

// =====================================================
// RECORD SALARY PAYMENT
// =====================================================

const recordStaffPayment = async (req, res) => {
  try {
    const {
      staffFeeId,
      amount,
      paymentDate,
      paymentMethod,
      transactionId,
      notes,
    } = req.body;

    if (!staffFeeId || !amount || !paymentDate || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          "Staff fee ID, amount, payment date and payment method are required",
      });
    }

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const paymentAmount = Number(amount);

    if (Number.isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than ₹0",
      });
    }

    const staffFee = await StaffFee.findOne({
      _id: staffFeeId,
      tenantId: req.user.tenantId,
      isActive: true,
    });

    if (!staffFee) {
      return res.status(404).json({
        success: false,
        message: "Staff fee record not found",
      });
    }

    const currentPending = Math.max(
      Number(staffFee.monthlySalary) - Number(staffFee.paidAmount),
      0,
    );

    if (currentPending <= 0) {
      return res.status(400).json({
        success: false,
        message: "This salary has already been fully paid",
      });
    }

    if (paymentAmount > currentPending) {
      return res.status(400).json({
        success: false,
        message: `Payment amount cannot exceed pending balance of ₹${currentPending.toLocaleString(
          "en-IN",
        )}`,
      });
    }

    const receiptNo = `SFP-${Date.now()}`;

    const newPayment = await StaffFeePayment.create({
      staffFeeId: staffFee._id,
      employeeId: staffFee.employeeId,
      employeeName: staffFee.employeeName,
      employeeType: staffFee.employeeType,
      academicSession: staffFee.academicSession,
      paymentMonth: staffFee.paymentMonth,
      amount: paymentAmount,
      paymentDate: new Date(paymentDate),
      paymentMethod,
      receiptNo,
      transactionId: transactionId?.trim() || null,
      notes: notes?.trim() || null,
      status: "SUCCESS",
      tenantId: req.user.tenantId,
    });

    // Update salary ledger
    staffFee.paidAmount = Number(staffFee.paidAmount) + paymentAmount;

    staffFee.pendingAmount =
      Number(staffFee.monthlySalary) - Number(staffFee.paidAmount);

    if (staffFee.pendingAmount < 0) {
      staffFee.pendingAmount = 0;
    }

    staffFee.paymentDate = new Date(paymentDate);
    staffFee.paymentMethod = paymentMethod;
    staffFee.transactionId = transactionId?.trim() || receiptNo;

    if (notes !== undefined) {
      staffFee.notes = notes?.trim() || null;
    }

    if (staffFee.pendingAmount === 0) {
      staffFee.status = "PAID";
    } else {
      staffFee.status = "PARTIAL";
    }

    await staffFee.save();

    return res.status(201).json({
      success: true,
      message: "Salary payment recorded successfully",
      payment: newPayment,
      staffFee,
    });
  } catch (error) {
    console.error("Record Staff Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record salary payment",
      error: error.message,
    });
  }
};

// =====================================================
// GET PAYMENT HISTORY
// =====================================================

const getStaffPaymentHistory = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const {
      academicSession,
      paymentMonth,
      employeeId,
      employeeType,
      paymentMethod,
      status,
    } = req.query;

    const query = {
      tenantId: req.user.tenantId,
    };

    if (academicSession) {
      query.academicSession = academicSession;
    }

    if (paymentMonth) {
      query.paymentMonth = paymentMonth;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (employeeType && employeeType !== "All") {
      query.employeeType = employeeType;
    }

    if (paymentMethod && paymentMethod !== "All") {
      query.paymentMethod = paymentMethod;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const payments = await StaffFeePayment.find(query).sort({
      paymentDate: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get Staff Payment History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

// =====================================================
// GET PAYMENTS FOR ONE EMPLOYEE
// =====================================================

const getEmployeePaymentHistory = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const payments = await StaffFeePayment.find({
      tenantId: req.user.tenantId,
      employeeId: req.params.employeeId,
    }).sort({
      paymentDate: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get Employee Payment History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee payment history",
      error: error.message,
    });
  }
};

// =====================================================
// DEACTIVATE STAFF FEE
// =====================================================

const deactivateStaffFee = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not associated with any school",
      });
    }

    const staffFee = await StaffFee.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId,
        isActive: true,
      },
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!staffFee) {
      return res.status(404).json({
        success: false,
        message: "Staff fee record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff fee record deactivated successfully",
      staffFee,
    });
  } catch (error) {
    console.error("Deactivate Staff Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate staff fee record",
      error: error.message,
    });
  }
};

const generateStaffFeeLedgers = async (req, res) => {
  try {
    const { academicSession, paymentMonth } = req.body;

    if (!academicSession || !paymentMonth) {
      return res.status(400).json({
        success: false,
        message: "Academic session and payment month are required",
      });
    }

    const tenantId = req.tenantId;

    const [faculty, staff] = await Promise.all([
      Faculty.find({
        tenantId,
        isActive: true,
      }),
      Staff.find({
        tenantId,
        isActive: true,
      }),
    ]);

    const employees = [
      ...faculty.map((item) => ({
        employeeId: item.employeeId || item._id.toString(),
        employeeType: "Teacher",
        employeeName: item.name || "",
        department: item.department || null,
        designation: item.designation || null,
        phone: item.phone || null,
        email: item.email || null,
        monthlySalary: Number(item.salary || 0),
      })),

      ...staff.map((item) => ({
        employeeId: item.employeeId || item._id.toString(),
        employeeType: "Staff",
        employeeName: item.name || "",
        department: item.department || null,
        designation: item.designation || null,
        phone: item.phone || null,
        email: item.email || null,
        monthlySalary: Number(item.salary || 0),
      })),
    ];

    const createdLedgers = [];

    for (const employee of employees) {
      if (employee.monthlySalary <= 0) {
        continue;
      }

      const existingLedger = await StaffFee.findOne({
        tenantId,
        employeeId: employee.employeeId,
        academicSession,
        paymentMonth,
      });

      if (existingLedger) {
        continue;
      }

      const ledger = await StaffFee.create({
        ...employee,
        academicSession,
        paymentMonth,
        paidAmount: 0,
        pendingAmount: employee.monthlySalary,
        status: "PENDING",
        tenantId,
        isActive: true,
      });

      createdLedgers.push(ledger);
    }

    return res.status(201).json({
      success: true,
      message: `${createdLedgers.length} staff fee ledger(s) generated successfully`,
      staffFees: createdLedgers,
    });
  } catch (error) {
    console.error("Generate staff fee ledgers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate staff fee ledgers",
      error: error.message,
    });
  }
};
module.exports = {
  createStaffFee,
  getAllStaffFees,
  getStaffFeeById,
  updateStaffFee,
  recordStaffPayment,
  getStaffPaymentHistory,
  getEmployeePaymentHistory,
  deactivateStaffFee,
  generateStaffFeeLedgers,
};
