const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
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

    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    department: {
      type: String,
      trim: true,
      default: null,
    },

    designation: {
      type: String,
      trim: true,
      default: null,
    },

    experience: {
      type: String,
      trim: true,
      default: null,
    },

    qualification: {
      type: String,
      trim: true,
      default: null,
    },

    salary: {
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

facultySchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });

const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;
