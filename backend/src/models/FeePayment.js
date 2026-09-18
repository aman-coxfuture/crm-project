const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },

    feeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fee",
      required: [true, "Fee ID is required"],
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant ID is required"],
    },

    receiptNo: {
      type: String,
      required: [true, "Receipt number is required"],
      unique: true,
      trim: true,
    },

    feeType: {
      type: String,
      required: [true, "Fee type is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: 1,
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Bank Transfer", "Cheque", "Other"],
      required: [true, "Payment method is required"],
    },

    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
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
  },
  { timestamps: true },
);

feePaymentSchema.index({
  tenantId: 1,
  studentId: 1,
  paymentDate: -1,
});

module.exports = mongoose.model("FeePayment", feePaymentSchema);
