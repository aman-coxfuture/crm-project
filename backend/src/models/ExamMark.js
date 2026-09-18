const mongoose = require("mongoose");

const examMarkSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam is required"],
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    maxMarks: {
      type: Number,
      required: [true, "Maximum marks are required"],
      min: 1,
    },

    marksObtained: {
      type: Number,
      required: [true, "Marks obtained are required"],
      min: 0,
    },

    grade: {
      type: String,
      trim: true,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      default: null,
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

examMarkSchema.index(
  {
    tenantId: 1,
    examId: 1,
    studentId: 1,
    subject: 1,
  },
  { unique: true },
);

module.exports = mongoose.model("ExamMark", examMarkSchema);
