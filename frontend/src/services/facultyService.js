import api from './api';
import { mockCollegeFaculty, mockUniversityFaculty } from '../mock/mockFaculty';

let localCollegeFaculty = [...mockCollegeFaculty];
let localUniversityFaculty = [...mockUniversityFaculty];

export const facultyService = {
  // --- COLLEGE FACULTY ---
  async getCollegeFaculty(params = {}) {
    try {
      // return await api.get('/college/faculty', { params });
      return [...localCollegeFaculty];
    } catch (error) {
      return [...localCollegeFaculty];
    }
  },

  async createCollegeFaculty(data) {
    try {
      // return await api.post('/college/faculty', data);
      const newFac = {
        ...data,
        id: `COL-FAC-00${localCollegeFaculty.length + 1}`,
      };
      localCollegeFaculty = [newFac, ...localCollegeFaculty];
      return newFac;
    } catch (error) {
      throw error;
    }
  },

  async updateCollegeFaculty(id, data) {
    try {
      // return await api.put(`/college/faculty/${id}`, data);
      localCollegeFaculty = localCollegeFaculty.map((f) => (f.id === id ? { ...f, ...data } : f));
      return localCollegeFaculty.find((f) => f.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteCollegeFaculty(id) {
    try {
      // return await api.delete(`/college/faculty/${id}`);
      localCollegeFaculty = localCollegeFaculty.filter((f) => f.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },

  // --- UNIVERSITY FACULTY ---
  async getUniversityFaculty(params = {}) {
    try {
      // return await api.get('/university/faculty', { params });
      return [...localUniversityFaculty];
    } catch (error) {
      return [...localUniversityFaculty];
    }
  },

  async createUniversityFaculty(data) {
    try {
      // return await api.post('/university/faculty', data);
      const newFac = {
        ...data,
        id: `UNIV-FAC-00${localUniversityFaculty.length + 1}`,
      };
      localUniversityFaculty = [newFac, ...localUniversityFaculty];
      return newFac;
    } catch (error) {
      throw error;
    }
  },

  async updateUniversityFaculty(id, data) {
    try {
      // return await api.put(`/university/faculty/${id}`, data);
      localUniversityFaculty = localUniversityFaculty.map((f) => (f.id === id ? { ...f, ...data } : f));
      return localUniversityFaculty.find((f) => f.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteUniversityFaculty(id) {
    try {
      // return await api.delete(`/university/faculty/${id}`);
      localUniversityFaculty = localUniversityFaculty.filter((f) => f.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default facultyService;
