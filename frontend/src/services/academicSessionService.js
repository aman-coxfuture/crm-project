import api from "./api";

const academicSessionService = {
  getAcademicSessions: () => api.get("/academic-sessions"),

  getActiveAcademicSessions: () => api.get("/academic-sessions/active"),

  createAcademicSession: (data) => api.post("/academic-sessions", data),

  updateAcademicSession: (id, data) =>
    api.put(`/academic-sessions/${id}`, data),

  deactivateAcademicSession: (id) =>
    api.patch(`/academic-sessions/${id}/deactivate`),
};

export default academicSessionService;
