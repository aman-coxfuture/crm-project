import api from "./api";

const attendanceService = {
  // Student Attendance
  getAttendance: (params = {}) => api.get("/attendance", { params }),

  markAttendance: (data) => api.post("/attendance", data),

  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),

  getStudentAttendanceSummary: (studentId) =>
    api.get(`/attendance/student/${studentId}`),

  getStudentAttendance: (params = {}) =>
    api.get("/student-attendance", { params }),

  markStudentAttendance: (data) => api.post("/student-attendance", data),

  updateStudentAttendance: (id, data) =>
    api.put(`/student-attendance/${id}`, data),

  // Faculty Attendance
  getFacultyAttendance: (params = {}) =>
    api.get("/faculty-attendance", { params }),

  markFacultyAttendance: (data) => api.post("/faculty-attendance", data),

  updateFacultyAttendance: (id, data) =>
    api.put(`/faculty-attendance/${id}`, data),

  getStaffAttendance: (params = {}) => api.get("/staff-attendance", { params }),

  markStaffAttendance: (data) => api.post("/staff-attendance", data),

  updateStaffAttendance: (id, data) => api.put(`/staff-attendance/${id}`, data),
};

export default attendanceService;
