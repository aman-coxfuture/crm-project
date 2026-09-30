const mongoose = require("mongoose");

const academicSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Academic session name is required"],
      trim: true,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
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

academicSessionSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("AcademicSession", academicSessionSchema);
