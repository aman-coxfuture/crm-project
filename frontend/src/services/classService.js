import api from './api';
import { mockSchoolClasses, mockSchoolTimetable } from '../mock/mockClasses';

let localClasses = [...mockSchoolClasses];

export const classService = {
  async getSchoolClasses(params = {}) {
    try {
      // return await api.get('/school/classes', { params });
      return [...localClasses];
    } catch (error) {
      return [...localClasses];
    }
  },

  async createSchoolClass(data) {
    try {
      // return await api.post('/school/classes', data);
      const newClass = {
        id: `CLS-${data.grade}${data.section}`,
        name: `Class ${data.grade} - Section ${data.section}`,
        ...data,
        totalStudents: 0,
      };
      localClasses = [...localClasses, newClass];
      return newClass;
    } catch (error) {
      throw error;
    }
  },

  async updateSchoolClass(id, data) {
    try {
      // return await api.put(`/school/classes/${id}`, data);
      localClasses = localClasses.map((c) => (c.id === id ? { ...c, ...data } : c));
      return localClasses.find((c) => c.id === id);
    } catch (error) {
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
