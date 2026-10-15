const mongoose = require("mongoose");

const superAdminSettingSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      trim: true,
      default: "EduEnterprise Global School CRM",
    },

    supportEmail: {
      type: String,
      trim: true,
      default: "support@schoolcrm.io",
    },

    academicYear: {
      type: String,
      trim: true,
      default: "2025-2026",
    },

    sessionTimeout: {
      type: String,
      trim: true,
      default: "60",
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("SuperAdminSetting", superAdminSettingSchema);
