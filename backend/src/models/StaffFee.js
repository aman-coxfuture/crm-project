const mongoose = require("mongoose");

const staffFeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
    },

    employeeType: {
      type: String,
      enum: ["Teacher", "Staff", "Driver"],
      required: [true, "Employee type is required"],
    },

    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
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

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
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

    status: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID"],
      default: "PENDING",
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant ID is required"],
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

staffFeeSchema.index(
  {
    tenantId: 1,
    employeeId: 1,
    academicSession: 1,
    paymentMonth: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("StaffFee", staffFeeSchema);
