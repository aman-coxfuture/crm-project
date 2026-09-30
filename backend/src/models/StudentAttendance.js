const mongoose = require("mongoose");

const studentAttendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolClass",
      required: true,
    },

    section: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT"],
      required: true,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// One attendance record per student per date
studentAttendanceSchema.index(
  {
    tenantId: 1,
    studentId: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("StudentAttendance", studentAttendanceSchema);
