const Tenant = require("../models/Tenant");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Staff = require("../models/Staff");
const Fee = require("../models/Fee");
const ExamMark = require("../models/ExamMark");
const getSuperAdminAnalytics = async (req, res) => {
  try {
    const [
      totalSchools,
      activeSchools,
      inactiveSchools,
      totalStudents,
      totalFaculty,
      totalStaff,
      schoolWiseStudents,
      revenueSummary,
      revenueBySchool,
      examPassRate,
    ] = await Promise.all([
      Tenant.countDocuments({ type: "SCHOOL" }),

      Tenant.countDocuments({
        type: "SCHOOL",
        status: "ACTIVE",
      }),

      Tenant.countDocuments({
        type: "SCHOOL",
        status: "INACTIVE",
      }),

      Student.countDocuments({
        isActive: true,
      }),

      Faculty.countDocuments({
        isActive: true,
      }),

      Staff.countDocuments({
        isActive: true,
      }),

      Student.aggregate([
        {
          $match: {
            isActive: true,
          },
        },
        {
          $group: {
            _id: "$tenantId",
            students: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "tenants",
            localField: "_id",
            foreignField: "_id",
            as: "tenant",
          },
        },
        {
          $unwind: "$tenant",
        },
        {
          $match: {
            "tenant.type": "SCHOOL",
          },
        },
        {
          $project: {
            _id: 0,
            tenantId: "$tenant._id",
            label: "$tenant.name",
            value: "$students",
          },
        },
        {
          $sort: {
            value: -1,
          },
        },
      ]),
      Fee.aggregate([
        {
          $match: {
            isActive: true,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $toDouble: {
                  $ifNull: ["$paidAmount", 0],
                },
              },
            },
          },
        },
      ]),

      Fee.aggregate([
        {
          $match: {
            isActive: true,
          },
        },
        {
          $group: {
            _id: "$tenantId",
            revenue: {
              $sum: {
                $toDouble: {
                  $ifNull: ["$paidAmount", 0],
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "tenants",
            localField: "_id",
            foreignField: "_id",
            as: "tenant",
          },
        },
        {
          $unwind: "$tenant",
        },
        {
          $match: {
            "tenant.type": "SCHOOL",
          },
        },
        {
          $project: {
            _id: 0,
            tenantId: "$tenant._id",
            label: "$tenant.name",
            value: "$revenue",
          },
        },
        {
          $sort: {
            value: -1,
          },
        },
      ]),
      ExamMark.aggregate([
        {
          $match: {
            isActive: true,
            maxMarks: { $gt: 0 },
          },
        },
        {
          $project: {
            marksObtained: { $toDouble: { $ifNull: ["$marksObtained", 0] } },
            maxMarks: { $toDouble: { $ifNull: ["$maxMarks", 0] } },
          },
        },
        {
          $group: {
            _id: null,
            totalEvaluated: { $sum: 1 },
            passed: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      {
                        $divide: ["$marksObtained", "$maxMarks"],
                      },
                      0.4,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        schools: {
          total: totalSchools,
          active: activeSchools,
          inactive: inactiveSchools,
        },

        users: {
          students: totalStudents,
          faculty: totalFaculty,
          staff: totalStaff,
        },

        schoolWiseStudents,

        revenue: {
          total: Number(revenueSummary?.[0]?.totalRevenue || 0),
          bySchool: revenueBySchool,
        },

        exam: {
          totalEvaluated: Number(examPassRate?.[0]?.totalEvaluated || 0),
          passed: Number(examPassRate?.[0]?.passed || 0),
          passRate:
            Number(examPassRate?.[0]?.totalEvaluated || 0) > 0
              ? Number(
                  (
                    (Number(examPassRate?.[0]?.passed || 0) /
                      Number(examPassRate?.[0]?.totalEvaluated || 1)) *
                    100
                  ).toFixed(1),
                )
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Super Admin analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load platform analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getSuperAdminAnalytics,
};
