const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE", "HALF_DAY"],
      required: true,
    },

    checkInTime: {
      type: String,
      default: null,
    },

    checkOutTime: {
      type: String,
      default: null,
    },

    remarks: {
      type: String,
      default: null,
      trim: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// One attendance record per student per date
attendanceSchema.index(
  { tenantId: 1, studentId: 1, date: 1 },
  { unique: true },
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
