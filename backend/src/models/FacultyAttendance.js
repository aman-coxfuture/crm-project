const mongoose = require("mongoose");

const facultyAttendanceSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
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
  { timestamps: true },
);

facultyAttendanceSchema.index(
  { tenantId: 1, facultyId: 1, date: 1 },
  { unique: true },
);

const FacultyAttendance = mongoose.model(
  "FacultyAttendance",
  facultyAttendanceSchema,
);

module.exports = FacultyAttendance;
