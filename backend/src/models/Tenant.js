const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tenant name is required"],
      trim: true,
      minlength: [2, "Tenant name must be at least 2 characters"],
      maxlength: [150, "Tenant name cannot exceed 150 characters"],
    },

    code: {
      type: String,
      required: [true, "Tenant code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Tenant code must be at least 3 characters"],
      maxlength: [20, "Tenant code cannot exceed 20 characters"],
      match: [
        /^[A-Z0-9_-]+$/,
        "Tenant code can contain only letters, numbers, hyphens and underscores",
      ],
    },

    type: {
      type: String,
      required: [true, "Tenant type is required"],
      enum: ["SCHOOL", "COLLEGE", "UNIVERSITY"],
      default: "SCHOOL",
    },

    email: {
      type: String,
      required: [true, "Tenant email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;
