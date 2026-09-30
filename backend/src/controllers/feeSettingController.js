const FeeSetting = require("../models/FeeSetting");

// Get Fine Settings
const getFeeSetting = async (req, res) => {
  try {
    const { academicSession } = req.query;

    if (!req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    if (!academicSession) {
      return res.status(400).json({
        success: false,
        message: "Academic session is required",
      });
    }

    let setting = await FeeSetting.findOne({
      tenantId: req.user.tenantId,
      academicSession,
      isActive: true,
    });

    // Return defaults if no setting exists yet
    if (!setting) {
      setting = {
        tenantId: req.user.tenantId,
        academicSession,
        fineType: "per_day",
        fineAmount: 50,
        fixedAmount: 500,
        gracePeriod: 5,
        isActive: true,
      };
    }

    return res.status(200).json({
      success: true,
      setting,
    });
  } catch (error) {
    console.error("Get Fee Setting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fine settings",
      error: error.message,
    });
  }
};

// Save Fine Settings
const saveFeeSetting = async (req, res) => {
  try {
    const { academicSession, fineType, fineAmount, fixedAmount, gracePeriod } =
      req.body;

    if (!req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    if (!academicSession || !fineType) {
      return res.status(400).json({
        success: false,
        message: "Academic session and fine type are required",
      });
    }

    if (!["per_day", "fixed"].includes(fineType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fine type",
      });
    }

    const perDayAmount = Number(fineAmount);
    const fixedFineAmount = Number(fixedAmount);
    const graceDays = Number(gracePeriod);

    if (!Number.isFinite(perDayAmount) || perDayAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Fine amount must be a valid number",
      });
    }

    if (!Number.isFinite(fixedFineAmount) || fixedFineAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Fixed amount must be a valid number",
      });
    }

    if (!Number.isFinite(graceDays) || graceDays < 0) {
      return res.status(400).json({
        success: false,
        message: "Grace period must be a valid number",
      });
    }

    const setting = await FeeSetting.findOneAndUpdate(
      {
        tenantId: req.user.tenantId,
        academicSession,
      },
      {
        tenantId: req.user.tenantId,
        academicSession,
        fineType,
        fineAmount: perDayAmount,
        fixedAmount: fixedFineAmount,
        gracePeriod: graceDays,
        isActive: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Fine settings saved successfully",
      setting,
    });
  } catch (error) {
    console.error("Save Fee Setting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save fine settings",
      error: error.message,
    });
  }
};

module.exports = {
  getFeeSetting,
  saveFeeSetting,
};
