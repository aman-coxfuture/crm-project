const Student = require("../models/Student");
const mongoose = require("mongoose");
const StudentAttendance = require("../models/StudentAttendance");
const Exam = require("../models/Exam");
const ExamMark = require("../models/ExamMark");
const Fee = require("../models/Fee");
const FeePayment = require("../models/FeePayment");
const TransportRoute = require("../models/TransportRoute");
const TransportVehicle = require("../models/TransportVehicle");
const SchoolClass = require("../models/SchoolClass");

const getReports = async (req, res) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.tenantId);

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    // =========================
    // STUDENT ADMISSIONS REPORT
    // =========================

    const activeStudents = await Student.countDocuments({
      tenantId,
      isActive: true,
    });

    const currentYear = new Date().getFullYear();

    const newAdmissions = await Student.countDocuments({
      tenantId,
      isActive: true,
      createdAt: {
        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
      },
    });

    const classWiseStudents = await Student.aggregate([
      {
        $match: {
          tenantId,
          isActive: true,
          classId: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "schoolclasses",
          localField: "classId",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $unwind: {
          path: "$class",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$class.name",
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          _id: { $ne: null },
        },
      },
      {
        $addFields: {
          classNumber: {
            $convert: {
              input: "$_id",
              to: "int",
              onError: 999,
              onNull: 999,
            },
          },
        },
      },
      {
        $sort: {
          classNumber: 1,
        },
      },
    ]);

    const studentReport = {
      totalEnrolled: activeStudents,
      newAdmissions: newAdmissions,
      graduationRate: null,
      classWiseStudents: classWiseStudents.map((item) => ({
        className: item._id || "Unknown",
        count: item.count,
      })),
    };

    // =========================
    // ATTENDANCE REPORT
    // =========================

    const attendanceRecords = await StudentAttendance.find({
      tenantId,
    }).lean();

    const totalAttendanceRecords = attendanceRecords.length;

    const presentRecords = attendanceRecords.filter(
      (record) => record.status === "PRESENT",
    ).length;

    const overallAttendanceRate =
      totalAttendanceRecords > 0
        ? Number(((presentRecords / totalAttendanceRecords) * 100).toFixed(1))
        : 0;

    // Student-wise attendance
    const studentAttendanceMap = {};

    attendanceRecords.forEach((record) => {
      const studentId = record.studentId.toString();

      if (!studentAttendanceMap[studentId]) {
        studentAttendanceMap[studentId] = {
          total: 0,
          present: 0,
        };
      }

      studentAttendanceMap[studentId].total += 1;

      if (record.status === "PRESENT") {
        studentAttendanceMap[studentId].present += 1;
      }
    });

    // =========================
    // ACADEMIC & EXAM REPORT
    // =========================

    const examMarks = await ExamMark.find({
      tenantId,
      isActive: true,
    }).lean();

    const gradeDistributionMap = {};

    examMarks.forEach((mark) => {
      let grade = mark.grade;

      // If grade is not stored, calculate it from percentage
      if (!grade && mark.maxMarks > 0) {
        const percentage = (mark.marksObtained / mark.maxMarks) * 100;

        if (percentage >= 90) {
          grade = "A+";
        } else if (percentage >= 80) {
          grade = "A";
        } else if (percentage >= 70) {
          grade = "B+";
        } else if (percentage >= 60) {
          grade = "B";
        } else {
          grade = "Below Pass";
        }
      }

      if (!grade) {
        grade = "Below Pass";
      }

      gradeDistributionMap[grade] = (gradeDistributionMap[grade] || 0) + 1;
    });

    const gradeOrder = ["A+", "A", "B+", "B", "Below Pass"];

    const gradeDistribution = gradeOrder
      .filter((grade) => gradeDistributionMap[grade] > 0)
      .map((grade) => ({
        label: grade,
        value: gradeDistributionMap[grade],
      }));
    // Subject-wise performance
    const subjectPerformanceMap = {};

    examMarks.forEach((mark) => {
      if (!mark.subject || !mark.maxMarks) {
        return;
      }

      if (!subjectPerformanceMap[mark.subject]) {
        subjectPerformanceMap[mark.subject] = {
          totalMarks: 0,
          totalMaxMarks: 0,
        };
      }

      subjectPerformanceMap[mark.subject].totalMarks += mark.marksObtained;

      subjectPerformanceMap[mark.subject].totalMaxMarks += mark.maxMarks;
    });

    const subjectPerformance = Object.entries(subjectPerformanceMap)
      .map(([subject, data]) => ({
        subject,
        averagePercentage:
          data.totalMaxMarks > 0
            ? Number(((data.totalMarks / data.totalMaxMarks) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage);
    // =========================
    // FEE REPORT
    // =========================

    const fees = await Fee.find({
      tenantId,
      isActive: true,
    }).lean();

    const totalFeeAmount = fees.reduce(
      (sum, fee) => sum + Number(fee.totalAmount || 0),
      0,
    );

    const realizedCollections = fees.reduce(
      (sum, fee) => sum + Number(fee.paidAmount || 0),
      0,
    );

    const pendingReceivables = fees.reduce(
      (sum, fee) => sum + Number(fee.pendingAmount || 0),
      0,
    );

    const now = new Date();

    const overdueDues = fees.reduce((sum, fee) => {
      const pendingAmount = Number(fee.pendingAmount || 0);

      if (pendingAmount > 0 && fee.dueDate && new Date(fee.dueDate) < now) {
        return sum + pendingAmount;
      }

      return sum;
    }, 0);

    const totalFineAmount = fees.reduce(
      (sum, fee) => sum + Number(fee.fineAmount || 0),
      0,
    );

    console.log("FEE AUDIT:", {
      totalFeeAmount,
      realizedCollections,
      pendingReceivables,
      totalFineAmount,
    });

    const feeReport = {
      totalFeeAmount,
      realizedCollections,
      pendingReceivables,
      overdueDues,
    };
    console.log("REPORT TENANT ID:", tenantId);

    const allTransportRoutes = await TransportRoute.find({}).lean();
    const allTransportVehicles = await TransportVehicle.find({}).lean();

    console.log("ALL TRANSPORT ROUTES:", allTransportRoutes);
    console.log("ALL TRANSPORT VEHICLES:", allTransportVehicles);
    // =========================
    // TRANSPORT REPORT
    // =========================

    const transportRoutes = await TransportRoute.find({
      tenantId,
      status: "Active",
    }).lean();

    const transportVehicles = await TransportVehicle.find({
      tenantId,
      status: "Active",
    }).lean();

    const vehicleCapacityMap = {};

    transportVehicles.forEach((vehicle) => {
      vehicleCapacityMap[vehicle.vehicleNumber] = Number(vehicle.capacity || 0);
    });

    const routeUtilization = transportRoutes.map((route) => {
      const totalStudents = Number(route.totalStudents || 0);
      const vehicleCapacity = vehicleCapacityMap[route.vehicle] || 0;

      const utilization =
        vehicleCapacity > 0
          ? Number(((totalStudents / vehicleCapacity) * 100).toFixed(1))
          : 0;

      return {
        routeName: route.name || "Unnamed Route",
        vehicleNumber: route.vehicle || "Not Assigned",
        totalStudents,
        vehicleCapacity,
        utilization: Math.min(utilization, 100),
      };
    });

    const transportReport = {
      totalRoutes: transportRoutes.length,
      totalVehicles: transportVehicles.length,
      routeUtilization,
    };
    console.log("TRANSPORT AUDIT:", {
      totalRoutes: transportRoutes.length,
      totalVehicles: transportVehicles.length,
      routes: transportRoutes.map((route) => ({
        name: route.name,
        vehicle: route.vehicle,
        totalStudents: route.totalStudents,
        status: route.status,
      })),
      vehicles: transportVehicles.map((vehicle) => ({
        vehicleNumber: vehicle.vehicleNumber,
        capacity: vehicle.capacity,
        status: vehicle.status,
      })),
    });

    const academicReport = {
      totalMarksRecorded: examMarks.length,
      gradeDistribution,
      subjectPerformance,
    };

    // Chronic absentees: attendance below 75%
    const chronicAbsenteeIds = Object.entries(studentAttendanceMap)
      .filter(([_, attendance]) => {
        const percentage =
          attendance.total > 0
            ? (attendance.present / attendance.total) * 100
            : 0;

        return percentage < 75;
      })
      .map(([studentId]) => studentId);

    // Class-wise attendance
    const classAttendanceMap = {};

    attendanceRecords.forEach((record) => {
      const classId = record.classId.toString();

      if (!classAttendanceMap[classId]) {
        classAttendanceMap[classId] = {
          total: 0,
          present: 0,
        };
      }

      classAttendanceMap[classId].total += 1;

      if (record.status === "PRESENT") {
        classAttendanceMap[classId].present += 1;
      }
    });

    const classIds = Object.keys(classAttendanceMap);

    const classes = await SchoolClass.find({
      _id: { $in: classIds },
      tenantId,
    })
      .select("name")
      .lean();

    const classNameMap = {};

    classes.forEach((schoolClass) => {
      classNameMap[schoolClass._id.toString()] = schoolClass.name;
    });

    const classWiseAttendance = Object.entries(classAttendanceMap)
      .map(([classId, attendance]) => ({
        className: classNameMap[classId] || "Unknown",
        attendanceRate:
          attendance.total > 0
            ? Number(((attendance.present / attendance.total) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate);

    const bestPerformingClass =
      classWiseAttendance.length > 0 ? classWiseAttendance[0] : null;

    // Monthly attendance trend
    const monthlyAttendanceMap = {};

    attendanceRecords.forEach((record) => {
      const date = new Date(record.date);

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (!monthlyAttendanceMap[monthKey]) {
        monthlyAttendanceMap[monthKey] = {
          total: 0,
          present: 0,
        };
      }

      monthlyAttendanceMap[monthKey].total += 1;

      if (record.status === "PRESENT") {
        monthlyAttendanceMap[monthKey].present += 1;
      }
    });

    const monthlyAttendanceTrend = Object.entries(monthlyAttendanceMap)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, attendance]) => {
        const [year, monthNumber] = month.split("-");

        const monthName = new Date(
          Number(year),
          Number(monthNumber) - 1,
          1,
        ).toLocaleString("en-IN", {
          month: "short",
        });

        return {
          label: `${monthName} ${year}`,
          value:
            attendance.total > 0
              ? Number(
                  ((attendance.present / attendance.total) * 100).toFixed(1),
                )
              : 0,
        };
      });

    const attendanceReport = {
      overallAttendanceRate,
      bestPerformingClass,
      chronicAbsentees: chronicAbsenteeIds.length,
      chronicAbsenteeThreshold: 75,
      monthlyAttendanceTrend,
      classWiseAttendance,
    };

    return res.status(200).json({
      success: true,
      message: "Reports generated successfully",
      reports: {
        student: studentReport,
        attendance: attendanceReport,
        academic: academicReport,
        fee: feeReport,
        transport: transportReport,
      },
    });
  } catch (error) {
    console.error("Get Reports Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate reports",
      error: error.message,
    });
  }
};

module.exports = {
  getReports,
};
