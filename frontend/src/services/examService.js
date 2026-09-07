import api from './api';
import { mockSchoolExams, mockCollegeExams } from '../mock/mockExams';

let localSchoolExams = [...mockSchoolExams];
let localCollegeExams = [...mockCollegeExams];

export const examService = {
  // --- SCHOOL EXAMS ---
  async getSchoolExams(params = {}) {
    try {
      // return await api.get('/school/exams', { params });
      return [...localSchoolExams];
    } catch (error) {
      return [...localSchoolExams];
    }
  },

  async createSchoolExam(data) {
    try {
      // return await api.post('/school/exams', data);
      const newExam = {
        id: `EX-0${localSchoolExams.length + 1}`,
        ...data,
      };
      localSchoolExams = [...localSchoolExams, newExam];
      return newExam;
    } catch (error) {
      throw error;
    }
  },

  async deleteSchoolExam(id) {
    try {
      // return await api.delete(`/school/exams/${id}`);
      localSchoolExams = localSchoolExams.filter((e) => e.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },

  // --- COLLEGE EXAMS ---
  async getCollegeExams(params = {}) {
    try {
      // return await api.get('/college/exams', { params });
      return [...localCollegeExams];
    } catch (error) {
      return [...localCollegeExams];
    }
  },

  async createCollegeExam(data) {
    try {
      // return await api.post('/college/exams', data);
      const newExam = {
        id: `EX-COL-0${localCollegeExams.length + 1}`,
        ...data,
      };
      localCollegeExams = [...localCollegeExams, newExam];
      return newExam;
    } catch (error) {
      throw error;
    }
  },

  async deleteCollegeExam(id) {
    try {
      // return await api.delete(`/college/exams/${id}`);
      localCollegeExams = localCollegeExams.filter((e) => e.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default examService;
