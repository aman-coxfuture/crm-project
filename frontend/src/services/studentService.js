import api from './api';
import { mockSchoolStudents, mockCollegeStudents, mockUniversityStudents } from '../mock/mockStudents';

let localSchoolStudents = [...mockSchoolStudents];
let localCollegeStudents = [...mockCollegeStudents];
let localUniversityStudents = [...mockUniversityStudents];

export const studentService = {
  // --- SCHOOL STUDENTS ---
  async getSchoolStudents(params = {}) {
    try {
      // return await api.get('/school/students', { params });
      return [...localSchoolStudents];
    } catch (error) {
      return [...localSchoolStudents];
    }
  },

  async createSchoolStudent(data) {
    try {
      // return await api.post('/school/students', data);
      const newStu = {
        ...data,
        id: `SCH-STU-00${localSchoolStudents.length + 1}`,
        admissionDate: data.admissionDate || new Date().toISOString().split('T')[0],
      };
      localSchoolStudents = [newStu, ...localSchoolStudents];
      return newStu;
    } catch (error) {
      throw error;
    }
  },

  async updateSchoolStudent(id, data) {
    try {
      // return await api.put(`/school/students/${id}`, data);
      localSchoolStudents = localSchoolStudents.map((s) => (s.id === id ? { ...s, ...data } : s));
      return localSchoolStudents.find((s) => s.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteSchoolStudent(id) {
    try {
      // return await api.delete(`/school/students/${id}`);
      localSchoolStudents = localSchoolStudents.filter((s) => s.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },

  // --- COLLEGE STUDENTS ---
  async getCollegeStudents(params = {}) {
    try {
      // return await api.get('/college/students', { params });
      return [...localCollegeStudents];
    } catch (error) {
      return [...localCollegeStudents];
    }
  },

  async createCollegeStudent(data) {
    try {
      // return await api.post('/college/students', data);
      const newStu = {
        ...data,
        id: `COL-STU-00${localCollegeStudents.length + 1}`,
      };
      localCollegeStudents = [newStu, ...localCollegeStudents];
      return newStu;
    } catch (error) {
      throw error;
    }
  },

  async updateCollegeStudent(id, data) {
    try {
      // return await api.put(`/college/students/${id}`, data);
      localCollegeStudents = localCollegeStudents.map((s) => (s.id === id ? { ...s, ...data } : s));
      return localCollegeStudents.find((s) => s.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteCollegeStudent(id) {
    try {
      // return await api.delete(`/college/students/${id}`);
      localCollegeStudents = localCollegeStudents.filter((s) => s.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },

  // --- UNIVERSITY STUDENTS ---
  async getUniversityStudents(params = {}) {
    try {
      // return await api.get('/university/students', { params });
      return [...localUniversityStudents];
    } catch (error) {
      return [...localUniversityStudents];
    }
  },

  async createUniversityStudent(data) {
    try {
      // return await api.post('/university/students', data);
      const newStu = {
        ...data,
        id: `UNIV-STU-00${localUniversityStudents.length + 1}`,
      };
      localUniversityStudents = [newStu, ...localUniversityStudents];
      return newStu;
    } catch (error) {
      throw error;
    }
  },

  async updateUniversityStudent(id, data) {
    try {
      // return await api.put(`/university/students/${id}`, data);
      localUniversityStudents = localUniversityStudents.map((s) => (s.id === id ? { ...s, ...data } : s));
      return localUniversityStudents.find((s) => s.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteUniversityStudent(id) {
    try {
      // return await api.delete(`/university/students/${id}`);
      localUniversityStudents = localUniversityStudents.filter((s) => s.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default studentService;
