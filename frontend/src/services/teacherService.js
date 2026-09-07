import api from './api';
import { mockSchoolTeachers } from '../mock/mockTeachers';

let localTeachers = [...mockSchoolTeachers];

export const teacherService = {
  async getSchoolTeachers(params = {}) {
    try {
      // return await api.get('/school/teachers', { params });
      return [...localTeachers];
    } catch (error) {
      return [...localTeachers];
    }
  },

  async createSchoolTeacher(data) {
    try {
      // return await api.post('/school/teachers', data);
      const newTeacher = {
        ...data,
        id: `SCH-TEA-00${localTeachers.length + 1}`,
        joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      };
      localTeachers = [newTeacher, ...localTeachers];
      return newTeacher;
    } catch (error) {
      throw error;
    }
  },

  async updateSchoolTeacher(id, data) {
    try {
      // return await api.put(`/school/teachers/${id}`, data);
      localTeachers = localTeachers.map((t) => (t.id === id ? { ...t, ...data } : t));
      return localTeachers.find((t) => t.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteSchoolTeacher(id) {
    try {
      // return await api.delete(`/school/teachers/${id}`);
      localTeachers = localTeachers.filter((t) => t.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default teacherService;
