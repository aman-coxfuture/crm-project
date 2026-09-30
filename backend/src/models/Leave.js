const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "applicantModel",
    },

    applicantModel: {
      type: String,
      enum: ["Faculty", "Student"],
      default: "Faculty",
      required: true,
    },

    applicantName: {
      type: String,
      required: true,
      trim: true,
    },

    leaveType: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    days: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewRemarks: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

leaveSchema.index({
  tenantId: 1,
  applicantId: 1,
  startDate: 1,
});

module.exports = mongoose.model("Leave", leaveSchema);
