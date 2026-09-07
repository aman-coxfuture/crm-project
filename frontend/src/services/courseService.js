import api from './api';
import { mockCollegeCourses, mockUniversityPrograms } from '../mock/mockCourses';

let localCourses = [...mockCollegeCourses];
let localPrograms = [...mockUniversityPrograms];

export const courseService = {
  // --- COLLEGE COURSES ---
  async getCollegeCourses(params = {}) {
    try {
      // return await api.get('/college/courses', { params });
      return [...localCourses];
    } catch (error) {
      return [...localCourses];
    }
  },

  async createCollegeCourse(data) {
    try {
      // return await api.post('/college/courses', data);
      const newCourse = {
        id: `CRS-00${localCourses.length + 1}`,
        ...data,
      };
      localCourses = [...localCourses, newCourse];
      return newCourse;
    } catch (error) {
      throw error;
    }
  },

  async updateCollegeCourse(id, data) {
    try {
      // return await api.put(`/college/courses/${id}`, data);
      localCourses = localCourses.map((c) => (c.id === id ? { ...c, ...data } : c));
      return localCourses.find((c) => c.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteCollegeCourse(id) {
    try {
      // return await api.delete(`/college/courses/${id}`);
      localCourses = localCourses.filter((c) => c.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },

  // --- UNIVERSITY PROGRAMS ---
  async getUniversityPrograms(params = {}) {
    try {
      // return await api.get('/university/programs', { params });
      return [...localPrograms];
    } catch (error) {
      return [...localPrograms];
    }
  },

  async createUniversityProgram(data) {
    try {
      // return await api.post('/university/programs', data);
      const newPgm = {
        id: `PGM-0${localPrograms.length + 1}`,
        ...data,
      };
      localPrograms = [...localPrograms, newPgm];
      return newPgm;
    } catch (error) {
      throw error;
    }
  },

  async updateUniversityProgram(id, data) {
    try {
      // return await api.put(`/university/programs/${id}`, data);
      localPrograms = localPrograms.map((p) => (p.id === id ? { ...p, ...data } : p));
      return localPrograms.find((p) => p.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteUniversityProgram(id) {
    try {
      // return await api.delete(`/university/programs/${id}`);
      localPrograms = localPrograms.filter((p) => p.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default courseService;
