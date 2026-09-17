import api from "./api";

export const assignmentService = {
  // Get all assignments for logged-in school
  async getAssignments() {
    return await api.get("/assignments");
  },

  // Get assignments of a particular faculty
  async getAssignmentsByFaculty(facultyId) {
    return await api.get(`/assignments/faculty/${facultyId}`);
  },

  // Create assignment
  async createAssignment(data) {
    return await api.post("/assignments", data);
  },

  // Update assignment
  async updateAssignment(id, data) {
    return await api.put(`/assignments/${id}`, data);
  },

  // Deactivate assignment
  async deleteAssignment(id) {
    return await api.patch(`/assignments/${id}/deactivate`);
  },

  // Reactivate assignment
  async reactivateAssignment(id) {
    return await api.patch(`/assignments/${id}/reactivate`);
  },
};
