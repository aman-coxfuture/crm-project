import api from "./api";

const staffService = {
  getSchoolStaff: () => api.get("/staff"),

  createSchoolStaff: (data) => api.post("/staff", data),

  updateSchoolStaff: (id, data) => api.put(`/staff/${id}`, data),

  deleteSchoolStaff: (id) => api.patch(`/staff/${id}/deactivate`),

  reactivateSchoolStaff: (id) => api.patch(`/staff/${id}/reactivate`),
};

export default staffService;
