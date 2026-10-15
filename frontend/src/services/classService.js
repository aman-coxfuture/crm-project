import api from "./api";
import { mockSchoolClasses, mockSchoolTimetable } from "../mock/mockClasses";

let localClasses = [...mockSchoolClasses];

export const classService = {
  async getSchoolClasses(params = {}) {
    try {
      const response = await api.get("/classes", { params });

      if (!response.success) {
        throw new Error(response.message || "Failed to load classes");
      }

      return response;
    } catch (error) {
      console.error("Failed to load classes from API:", error);

      return {
        success: true,
        classes: [...localClasses],
      };
    }
  },

  async createSchoolClass(data) {
    try {
      const response = await api.post("/classes", data);

      if (!response.success) {
        throw new Error(response.message || "Failed to create class");
      }

      return response;
    } catch (error) {
      console.error("Failed to create class:", error);
      throw error;
    }
  },

  async updateSchoolClass(id, data) {
    try {
      const response = await api.put(`/classes/${id}`, data);

      if (!response.success) {
        throw new Error(response.message || "Failed to update class");
      }

      return response;
    } catch (error) {
      console.error("Failed to update class:", error);
      throw error;
    }
  },

  async deleteSchoolClass(id) {
    try {
      // return await api.delete(`/school/classes/${id}`);
      localClasses = localClasses.filter((c) => c.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },

  async getSchoolTimetable(classId) {
    try {
      // return await api.get(`/school/timetable/${classId}`);
      return [...mockSchoolTimetable];
    } catch (error) {
      return [...mockSchoolTimetable];
    }
  },
};

export default classService;
