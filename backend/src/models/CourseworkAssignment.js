const mongoose = require("mongoose");

const courseworkAssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
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

    dueDate: {
      type: Date,
      required: true,
    },

    maxMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    submissions: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },

        studentName: {
          type: String,
          trim: true,
          default: "",
        },

        submittedAt: {
          type: Date,
          default: null,
        },

        status: {
          type: String,
          enum: ["SUBMITTED", "PENDING", "GRADED"],
          default: "PENDING",
        },

        marks: {
          type: Number,
          default: null,
        },

        feedback: {
          type: String,
          trim: true,
          default: "",
        },

        file: {
          originalName: { type: String, default: "" },
          fileName: { type: String, default: "" },
          fileUrl: { type: String, default: "" },
          mimeType: { type: String, default: "" },
          size: { type: Number, default: 0 },
        },
      },
    ],

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
  {
    timestamps: true,
  },
);

courseworkAssignmentSchema.index({
  tenantId: 1,
  facultyId: 1,
  classId: 1,
  section: 1,
});

module.exports = mongoose.model(
  "CourseworkAssignment",
  courseworkAssignmentSchema,
);
