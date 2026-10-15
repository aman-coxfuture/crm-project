const InstitutionSetting = require("../models/InstitutionSetting");
const SuperAdminSetting = require("../models/SuperAdminSetting");
// GET institution settings
const getInstitutionSettings = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    let settings = await InstitutionSetting.findOne({ tenantId }).lean();

    // Create default settings for a new institution
    if (!settings) {
      settings = await InstitutionSetting.create({
        tenantId,
        institutionName: "",
        schoolCode: "",
        principal: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        establishedYear: "",
        affiliation: "CBSE / State Board",
        academicSession: "2026-2027",
        logo: "🏫",
        currency: "INR (₹)",
        emailAlerts: true,
        smsAlerts: true,
      });

      settings = settings.toObject();
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get institution settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch institution settings",
    });
  }
};

// UPDATE institution settings
const updateInstitutionSettings = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const {
      institutionName,
      schoolCode,
      principal,
      email,
      phone,
      address,
      website,
      establishedYear,
      affiliation,
      academicSession,
      logo,
      currency,
      emailAlerts,
      smsAlerts,
    } = req.body;

    const settings = await InstitutionSetting.findOneAndUpdate(
      { tenantId },
      {
        ...(institutionName !== undefined && { institutionName }),
        ...(schoolCode !== undefined && { schoolCode }),
        ...(principal !== undefined && { principal }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(website !== undefined && { website }),
        ...(establishedYear !== undefined && { establishedYear }),
        ...(affiliation !== undefined && { affiliation }),
        ...(academicSession !== undefined && { academicSession }),
        ...(logo !== undefined && { logo }),
        ...(currency !== undefined && { currency }),
        ...(emailAlerts !== undefined && { emailAlerts }),
        ...(smsAlerts !== undefined && { smsAlerts }),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Institution settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update institution settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update institution settings",
    });
  }
};

// GET global Super Admin settings
const getSuperAdminSettings = async (req, res) => {
  try {
    let settings = await SuperAdminSetting.findOne().lean();

    // Create default global settings if none exist
    if (!settings) {
      settings = await SuperAdminSetting.create({
        platformName: "EduEnterprise Global School CRM",
        supportEmail: "support@schoolcrm.io",
        academicYear: "2025-2026",
        sessionTimeout: "60",
        maintenanceMode: false,
      });

      settings = settings.toObject();
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get Super Admin settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Super Admin settings",
    });
  }
};

// UPDATE global Super Admin settings
const updateSuperAdminSettings = async (req, res) => {
  try {
    const {
      platformName,
      supportEmail,
      academicYear,
      sessionTimeout,
      maintenanceMode,
    } = req.body;

    const settings = await SuperAdminSetting.findOneAndUpdate(
      {},
      {
        ...(platformName !== undefined && { platformName }),
        ...(supportEmail !== undefined && { supportEmail }),
        ...(academicYear !== undefined && { academicYear }),
        ...(sessionTimeout !== undefined && { sessionTimeout }),
        ...(maintenanceMode !== undefined && { maintenanceMode }),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Super Admin settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update Super Admin settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Super Admin settings",
    });
  }
};

module.exports = {
  getInstitutionSettings,
  updateInstitutionSettings,
  getSuperAdminSettings,
  updateSuperAdminSettings,
};
