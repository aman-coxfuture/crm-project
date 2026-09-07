import api from './api';
import { mockCollegeAdmissions, mockUniversityAdmissions } from '../mock/mockAdmissions';

let localCollegeAdmissions = [...mockCollegeAdmissions];
let localUniversityAdmissions = [...mockUniversityAdmissions];

export const admissionService = {
  // --- COLLEGE ADMISSIONS ---
  async getCollegeAdmissions(params = {}) {
    try {
      // return await api.get('/college/admissions', { params });
      return [...localCollegeAdmissions];
    } catch (error) {
      return [...localCollegeAdmissions];
    }
  },

  async createCollegeAdmission(data) {
    try {
      // return await api.post('/college/admissions', data);
      const newAdm = {
        id: `ADM-2026-0${localCollegeAdmissions.length + 95}`,
        applicationDate: data.applicationDate || new Date().toISOString().split('T')[0],
        ...data,
      };
      localCollegeAdmissions = [newAdm, ...localCollegeAdmissions];
      return newAdm;
    } catch (error) {
      throw error;
    }
  },

  async updateCollegeAdmissionStatus(id, status) {
    try {
      // return await api.patch(`/college/admissions/${id}/status`, { status });
      localCollegeAdmissions = localCollegeAdmissions.map((a) =>
        a.id === id ? { ...a, status } : a
      );
      return localCollegeAdmissions.find((a) => a.id === id);
    } catch (error) {
      throw error;
    }
  },

  // --- UNIVERSITY ADMISSIONS ---
  async getUniversityAdmissions(params = {}) {
    try {
      // return await api.get('/university/admissions', { params });
      return [...localUniversityAdmissions];
    } catch (error) {
      return [...localUniversityAdmissions];
    }
  },

  async createUniversityAdmission(data) {
    try {
      // return await api.post('/university/admissions', data);
      const newAdm = {
        id: `UNIV-ADM-0${localUniversityAdmissions.length + 1}`,
        ...data,
      };
      localUniversityAdmissions = [newAdm, ...localUniversityAdmissions];
      return newAdm;
    } catch (error) {
      throw error;
    }
  },

  async updateUniversityAdmissionStatus(id, status) {
    try {
      // return await api.patch(`/university/admissions/${id}/status`, { status });
      localUniversityAdmissions = localUniversityAdmissions.map((a) =>
        a.id === id ? { ...a, status } : a
      );
      return localUniversityAdmissions.find((a) => a.id === id);
    } catch (error) {
      throw error;
    }
  },
};

export default admissionService;
