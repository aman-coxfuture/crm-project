import api from "./api";

const attendanceService = {
  // Get attendance records
  // Optional filters: date, studentId
  getAttendance: (params = {}) => api.get("/attendance", { params }),

  // Mark attendance
  markAttendance: (data) => api.post("/attendance", data),

  // Update existing attendance
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),

  // Get attendance summary for one student
  getStudentAttendanceSummary: (studentId) =>
    api.get(`/attendance/student/${studentId}`),
};

export default attendanceService;
