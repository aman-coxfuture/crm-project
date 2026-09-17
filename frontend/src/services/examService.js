import api from "./api";

const examService = {
  // =====================================================
  // SCHOOL EXAMS
  // =====================================================

  getSchoolExams: (params = {}) => api.get("/exams", { params }),

  getSchoolExamById: (id) => api.get(`/exams/${id}`),

  createSchoolExam: (data) => api.post("/exams", data),

  updateSchoolExam: (id, data) => api.put(`/exams/${id}`, data),

  deleteSchoolExam: (id) => api.patch(`/exams/${id}/deactivate`),

  reactivateSchoolExam: (id) => api.patch(`/exams/${id}/reactivate`),

  // =====================================================
  // COLLEGE EXAMS
  // =====================================================
  // College backend abhi nahi banaya hai.
  // Isliye in methods ko filhaal remove/use nahi karna.
};

export default examService;
