const mongoose = require("mongoose");

const staffFeePaymentSchema = new mongoose.Schema(
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

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: 1,
    },

    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Bank Transfer", "Cheque", "Other"],
      required: [true, "Payment method is required"],
    },

    receiptNo: {
      type: String,
      required: [true, "Receipt number is required"],
      unique: true,
      trim: true,
    },

    transactionId: {
      type: String,
      trim: true,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "CANCELLED"],
      default: "SUCCESS",
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant ID is required"],
    },
  },
  {
    timestamps: true,
  },
);

staffFeePaymentSchema.index({
  tenantId: 1,
  employeeId: 1,
  paymentDate: -1,
});

module.exports = mongoose.model("StaffFeePayment", staffFeePaymentSchema);
