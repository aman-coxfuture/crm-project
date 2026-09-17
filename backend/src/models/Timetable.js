const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ],
    },

    period: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
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

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    room: {
      type: String,
      default: null,
      trim: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

timetableSchema.index(
  {
    tenantId: 1,
    day: 1,
    period: 1,
    classId: 1,
    section: 1,
  },
  { unique: true },
);

module.exports = mongoose.model("Timetable", timetableSchema);
