const Tenant = require("../models/Tenant");

const getMySchool = async (req, res) => {
  try {
    const school = await Tenant.findOne({
      _id: req.tenantId,
      type: "SCHOOL",
      status: "ACTIVE",
    }).select("-__v");

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    return res.status(200).json({
      success: true,
      school,
    });
  } catch (error) {
    console.error("Get my school error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getMySchool,
};
