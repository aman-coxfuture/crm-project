const mongoose = require("mongoose");

const transportDriverSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleNumber: {
      type: String,
      trim: true,
    },

    vehicleType: {
      type: String,
      trim: true,
    },

    route: {
      type: String,
      trim: true,
    },

    assignedStudents: {
      type: Number,
      default: 0,
      min: 0,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TransportDriver", transportDriverSchema);
