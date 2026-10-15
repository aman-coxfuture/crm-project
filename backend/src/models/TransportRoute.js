const mongoose = require("mongoose");

const transportRouteSchema = new mongoose.Schema(
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

    driver: {
      type: String,
      trim: true,
    },

    vehicle: {
      type: String,
      trim: true,
    },

    totalStudents: {
      type: Number,
      default: 0,
      min: 0,
    },

    pickupTime: {
      type: String,
      trim: true,
    },

    dropTime: {
      type: String,
      trim: true,
    },

    stops: {
      type: [String],
      default: [],
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

module.exports = mongoose.model("TransportRoute", transportRouteSchema);
