const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    admissionNumber: {
      type: String,
      required: [true, "Admission number is required"],
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    parentName: {
      type: String,
      trim: true,
      default: null,
    },

    parentPhone: {
      type: String,
      trim: true,
      default: null,
    },

    emergencyContact: {
      type: String,
      trim: true,
      default: null,
    },

    bloodGroup: {
      type: String,
      trim: true,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: null,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolClass",
      default: null,
    },

    className: {
      type: String,
      trim: true,
      default: null,
    },

    section: {
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

studentSchema.index({ tenantId: 1, admissionNumber: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
