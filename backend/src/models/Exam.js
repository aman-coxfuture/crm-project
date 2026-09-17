const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Examination name is required"],
      trim: true,
    },

    term: {
      type: String,
      required: [true, "Academic term is required"],
      trim: true,
    },

    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
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

    classesIncluded: [
      {
        classId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SchoolClass",
        },

        className: {
          type: String,
          trim: true,
        },

        sections: [
          {
            type: String,
            trim: true,
          },
        ],
      },
    ],

    schedule: [
      {
        date: {
          type: Date,
          required: true,
        },

        subject: {
          type: String,
          required: true,
          trim: true,
        },

        startTime: {
          type: String,
          required: true,
        },

        endTime: {
          type: String,
          required: true,
        },

        maxMarks: {
          type: Number,
          required: true,
          min: 1,
        },

        passMarks: {
          type: Number,
          required: true,
          min: 0,
        },

        room: {
          type: String,
          default: null,
          trim: true,
        },
      },
    ],

    status: {
      type: String,
      enum: ["DRAFT", "SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "DRAFT",
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
  {
    timestamps: true,
  },
);

examSchema.index({
  tenantId: 1,
  academicYear: 1,
  name: 1,
});

module.exports = mongoose.model("Exam", examSchema);
