const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Faculty ID is required"],
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolClass",
      required: [true, "Class ID is required"],
    },

    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    room: {
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

assignmentSchema.index(
  {
    tenantId: 1,
    facultyId: 1,
    classId: 1,
    section: 1,
    subject: 1,
  },
  { unique: true },
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
