const SalarySlip = require("../models/SalarySlip");
const StaffFee = require("../models/StaffFee");
const PDFDocument = require("pdfkit");

const generateSalarySlip = async (req, res) => {
  try {
    const { staffFeeId } = req.body;

    if (!staffFeeId) {
      return res.status(400).json({
        success: false,
        message: "Staff fee ID is required",
      });
    }

    const staffFee = await StaffFee.findOne({
      _id: staffFeeId,
      tenantId: req.tenantId,
      isActive: true,
    });

    if (!staffFee) {
      return res.status(404).json({
        success: false,
        message: "Staff fee record not found",
      });
    }

    // Prevent duplicate salary slip for same employee/month
    const existingSlip = await SalarySlip.findOne({
      staffFeeId: staffFee._id,
      academicSession: staffFee.academicSession,
      paymentMonth: staffFee.paymentMonth,
    });

    if (existingSlip) {
      return res.status(200).json({
        success: true,
        message: "Salary slip already generated for this month",
        salarySlip: existingSlip,
      });
    }

    const salarySlip = await SalarySlip.create({
      staffFeeId: staffFee._id,
      tenantId: req.tenantId,
      employeeId: staffFee.employeeId,
      employeeName: staffFee.employeeName,
      employeeType: staffFee.employeeType,
      department: staffFee.department,
      designation: staffFee.designation,
      monthlySalary: staffFee.monthlySalary,
      academicSession: staffFee.academicSession,
      paymentMonth: staffFee.paymentMonth,
      paidAmount: staffFee.paidAmount,
      pendingAmount: staffFee.pendingAmount,
      paymentDate: staffFee.paymentDate,
      paymentMethod: staffFee.paymentMethod,
      transactionId: staffFee.transactionId,
    });

    return res.status(201).json({
      success: true,
      message: "Salary slip generated successfully",
      salarySlip,
    });
  } catch (error) {
    console.error("Generate salary slip error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate salary slip",
      error: error.message,
    });
  }
};

const downloadSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;

    const salarySlip = await SalarySlip.findOne({
      _id: id,
      isActive: true,
    });

    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        message: "Salary slip not found",
      });
    }

    if (
      req.user.role !== "SUPER_ADMIN" &&
      salarySlip.tenantId &&
      salarySlip.tenantId.toString() !== req.tenantId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Salary_Slip_${salarySlip.employeeName}_${salarySlip.paymentMonth}.pdf"`,
    );

    doc.pipe(res);

    doc.fontSize(20).font("Helvetica-Bold").text("GREENWOOD PUBLIC SCHOOL", {
      align: "center",
    });

    doc.fontSize(11).font("Helvetica").text("Salary Slip", { align: "center" });

    doc.moveDown(1.5);

    doc.fontSize(11).font("Helvetica-Bold").text("Employee Details");

    doc.moveDown(0.5);

    doc.font("Helvetica");
    doc.text(`Employee Name: ${salarySlip.employeeName}`);
    doc.text(`Employee ID: ${salarySlip.employeeId}`);
    doc.text(`Employee Type: ${salarySlip.employeeType}`);
    doc.text(`Department: ${salarySlip.department || "—"}`);
    doc.text(`Designation: ${salarySlip.designation || "—"}`);
    doc.text(`Academic Session: ${salarySlip.academicSession}`);
    doc.text(`Salary Month: ${salarySlip.paymentMonth}`);

    doc.moveDown(1);

    doc.font("Helvetica-Bold").text("Salary Details");

    doc.moveDown(0.5);

    doc.font("Helvetica");
    doc.text(
      `Monthly Salary: ₹${salarySlip.monthlySalary.toLocaleString("en-IN")}`,
    );
    doc.text(`Paid Amount: ₹${salarySlip.paidAmount.toLocaleString("en-IN")}`);
    doc.text(
      `Pending Amount: ₹${salarySlip.pendingAmount.toLocaleString("en-IN")}`,
    );

    doc.moveDown(1);

    doc.font("Helvetica-Bold").text("Payment Details");

    doc.moveDown(0.5);

    doc.font("Helvetica");
    doc.text(
      `Payment Date: ${
        salarySlip.paymentDate
          ? new Date(salarySlip.paymentDate).toLocaleDateString("en-IN")
          : "—"
      }`,
    );
    doc.text(`Payment Method: ${salarySlip.paymentMethod || "—"}`);
    doc.text(`Transaction ID: ${salarySlip.transactionId || "—"}`);

    doc.moveDown(2);

    doc
      .fontSize(9)
      .fillColor("gray")
      .text("This is a system-generated salary slip.", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Download salary slip error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate salary slip PDF",
        error: error.message,
      });
    }
  }
};
const getSalarySlips = async (req, res) => {
  try {
    const { academicSession, paymentMonth } = req.query;

    const filter = {
      tenantId: req.tenantId,
      isActive: true,
    };

    if (academicSession) {
      filter.academicSession = academicSession;
    }

    if (paymentMonth) {
      filter.paymentMonth = paymentMonth;
    }

    const salarySlips = await SalarySlip.find(filter).sort({
      employeeName: 1,
    });

    return res.status(200).json({
      success: true,
      count: salarySlips.length,
      salarySlips,
    });
  } catch (error) {
    console.error("Get salary slips error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch salary slips",
      error: error.message,
    });
  }
};

module.exports = {
  generateSalarySlip,
  downloadSalarySlip,
  getSalarySlips,
};
