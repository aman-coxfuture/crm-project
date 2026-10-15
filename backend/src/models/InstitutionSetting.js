const mongoose = require("mongoose");

const institutionSettingSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    // Institutional Identity
    institutionName: {
      type: String,
      trim: true,
      default: "",
    },

    schoolCode: {
      type: String,
      trim: true,
      default: "",
    },

    principal: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    establishedYear: {
      type: String,
      trim: true,
      default: "",
    },

    affiliation: {
      type: String,
      trim: true,
      default: "CBSE / State Board",
    },

    academicSession: {
      type: String,
      trim: true,
      default: "2026-2027",
    },

    logo: {
      type: String,
      trim: true,
      default: "🏫",
    },

    // Other institution settings
    currency: {
      type: String,
      trim: true,
      default: "INR (₹)",
    },

    emailAlerts: {
      type: Boolean,
      default: true,
    },

    smsAlerts: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("InstitutionSetting", institutionSettingSchema);
