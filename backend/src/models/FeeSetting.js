const mongoose = require("mongoose");

const feeSettingSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant ID is required"],
    },

    academicSession: {
      type: String,
      required: [true, "Academic session is required"],
      trim: true,
    },

    fineType: {
      type: String,
      enum: ["per_day", "fixed"],
      default: "per_day",
    },

    fineAmount: {
      type: Number,
      default: 50,
      min: 0,
    },

    fixedAmount: {
      type: Number,
      default: 500,
      min: 0,
    },

    gracePeriod: {
      type: Number,
      default: 5,
      min: 0,
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

feeSettingSchema.index({ tenantId: 1, academicSession: 1 }, { unique: true });

module.exports = mongoose.model("FeeSetting", feeSettingSchema);
