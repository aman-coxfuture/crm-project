import api from "./api";

const examService = {
  getSchoolExams: (params = {}) => api.get("/exams", { params }),
  getSchoolExamById: (id) => api.get(`/exams/${id}`),
  createSchoolExam: (data) => api.post("/exams", data),
  updateSchoolExam: (id, data) => api.put(`/exams/${id}`, data),
  deleteSchoolExam: (id) => api.patch(`/exams/${id}/deactivate`),
  reactivateSchoolExam: (id) => api.patch(`/exams/${id}/reactivate`),

  getStudentResult: (examId, studentId) =>
    api.get(`/exam-marks/result/${examId}/${studentId}`),
};

export default examService;
