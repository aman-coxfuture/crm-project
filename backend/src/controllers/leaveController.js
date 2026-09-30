const Leave = require("../models/Leave");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      applicantId: req.user.userId,
      tenantId: req.tenantId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    console.error("Get My Leaves Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave applications",
    });
  }
};

const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, days, reason } = req.body;

    // 1. Required fields validation
    if (!leaveType || !startDate || !endDate || !days || !reason) {
      return res.status(400).json({
        success: false,
        message: "All leave fields are required",
      });
    }

    // 2. Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date",
      });
    }

    // 3. Date range validation
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // 4. Calculate actual number of leave days
    const calculatedDays =
      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // 5. Verify frontend days value
    if (Number(days) !== calculatedDays) {
      return res.status(400).json({
        success: false,
        message: `Invalid leave days. Selected dates contain ${calculatedDays} day(s).`,
      });
    }

    // 6. Verify faculty
    const faculty = await Faculty.findOne({
      _id: req.user.userId,
      tenantId: req.tenantId,
      isActive: true,
    }).select("name");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found",
      });
    }

    const overlappingLeave = await Leave.findOne({
      applicantId: req.user.userId,
      tenantId: req.tenantId,
      status: { $in: ["PENDING", "APPROVED"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlappingLeave) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a pending or approved leave overlapping these dates.",
      });
    }

    // 7. Create leave
    const leave = await Leave.create({
      applicantId: req.user.userId,
      applicantName: faculty.name,
      leaveType,
      startDate,
      endDate,
      days: calculatedDays,
      reason: reason.trim(),
      status: "PENDING",
      tenantId: req.tenantId,
    });

    return res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    console.error("Apply Leave Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit leave application",
    });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      tenantId: req.tenantId,
    })
      .populate("applicantId", "name email employeeId department designation")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    console.error("Get All Leaves Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave applications",
    });
  }
};

const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewRemarks } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const leave = await Leave.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found",
      });
    }

    if (leave.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave applications can be reviewed",
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user.userId;
    leave.reviewRemarks = reviewRemarks?.trim() || null;

    await leave.save();

    return res.status(200).json({
      success: true,
      message:
        status === "APPROVED"
          ? "Leave application approved successfully"
          : "Leave application rejected successfully",
      leave,
    });
  } catch (error) {
    console.error("Review Leave Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review leave application",
    });
  }
};

module.exports = {
  getMyLeaves,
  applyLeave,
  getAllLeaves,
  reviewLeave,
};
