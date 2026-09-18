const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const userRoutes = require("./routes/userRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const facultyAttendanceRoutes = require("./routes/facultyAttendanceRoutes");
const staffAttendanceRoutes = require("./routes/staffAttendanceRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const examRoutes = require("./routes/examRoutes");
const examMarkRoutes = require("./routes/examMarkRoutes");
const feeRoutes = require("./routes/feeRoutes");
const feePaymentRoutes = require("./routes/feePaymentRoutes");
const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/faculty-attendance", facultyAttendanceRoutes);
app.use("/api/staff-attendance", staffAttendanceRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/exam-marks", examMarkRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/fee-payments", feePaymentRoutes);
module.exports = app;
