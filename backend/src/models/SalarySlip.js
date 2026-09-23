const mongoose = require("mongoose");

const salarySlipSchema = new mongoose.Schema(
  {
    staffFeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffFee",
      required: [true, "Staff fee ID is required"],
    },

    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
    },

    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },

    employeeType: {
      type: String,
      enum: ["Teacher", "Staff", "Driver"],
      required: [true, "Employee type is required"],
    },

    department: {
      type: String,
      trim: true,
      default: null,
    },

    designation: {
      type: String,
      trim: true,
      default: null,
    },

    monthlySalary: {
      type: Number,
      required: [true, "Monthly salary is required"],
      min: 0,
    },

    academicSession: {
      type: String,
      required: [true, "Academic session is required"],
      trim: true,
    },

    paymentMonth: {
      type: String,
      required: [true, "Payment month is required"],
      trim: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Bank Transfer", "Cheque", "Other"],
      default: null,
    },

    transactionId: {
      type: String,
      trim: true,
      default: null,
    },

    receiptNo: {
      type: String,
      trim: true,
      default: null,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant ID is required"],
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// One salary slip per employee per month
salarySlipSchema.index(
  {
    staffFeeId: 1,
    academicSession: 1,
    paymentMonth: 1,
  },
  { unique: true },
);

module.exports = mongoose.model("SalarySlip", salarySlipSchema);
