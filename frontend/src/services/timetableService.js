import api from "./api";

const timetableService = {
  getTimetable: (params = {}) => api.get("/timetable", { params }),

  createTimetable: (data) => api.post("/timetable", data),

  updateTimetable: (id, data) => api.put(`/timetable/${id}`, data),

  deleteTimetable: (id) => api.patch(`/timetable/${id}/deactivate`),

  reactivateTimetable: (id) => api.patch(`/timetable/${id}/reactivate`),
};

export default timetableService;
