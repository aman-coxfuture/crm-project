const mongoose = require("mongoose");

const staffAttendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
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

staffAttendanceSchema.index(
  { tenantId: 1, staffId: 1, date: 1 },
  { unique: true },
);

const StaffAttendance = mongoose.model(
  "StaffAttendance",
  staffAttendanceSchema,
);

module.exports = StaffAttendance;
