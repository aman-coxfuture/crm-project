import api from "./api";
import {
  mockSchoolStudents,
  mockCollegeStudents,
  mockUniversityStudents,
} from "../mock/mockStudents";

let localSchoolStudents = [...mockSchoolStudents];
let localCollegeStudents = [...mockCollegeStudents];
let localUniversityStudents = [...mockUniversityStudents];

export const studentService = {
  // --- SCHOOL STUDENTS ---
  async getSchoolStudents() {
    return await api.get("/students");
  },

  async createSchoolStudent(data) {
    return await api.post("/students", data);
  },

  async updateSchoolStudent(id, data) {
    return await api.put(`/students/${id}`, data);
  },

  async deleteSchoolStudent(id) {
    return await api.patch(`/students/${id}/deactivate`);
  },

  async reactivateSchoolStudent(id) {
    return await api.patch(`/students/${id}/reactivate`);
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
      localCollegeStudents = localCollegeStudents.map((s) =>
        s.id === id ? { ...s, ...data } : s,
      );
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
      localUniversityStudents = localUniversityStudents.map((s) =>
        s.id === id ? { ...s, ...data } : s,
      );
      return localUniversityStudents.find((s) => s.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteUniversityStudent(id) {
    try {
      // return await api.delete(`/university/students/${id}`);
      localUniversityStudents = localUniversityStudents.filter(
        (s) => s.id !== id,
      );
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default studentService;
