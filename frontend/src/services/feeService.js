import api from './api';
import { mockSchoolFees, mockCollegeFees, mockUniversityFees } from '../mock/mockFees';

let localSchoolFees = [...mockSchoolFees];
let localCollegeFees = [...mockCollegeFees];
let localUniversityFees = [...mockUniversityFees];

export const feeService = {
  // --- SCHOOL FEES ---
  async getSchoolFees(params = {}) {
    try {
      // return await api.get('/school/fees', { params });
      return [...localSchoolFees];
    } catch (error) {
      return [...localSchoolFees];
    }
  },

  async createSchoolFee(data) {
    try {
      // return await api.post('/school/fees', data);
      const newInvoice = {
        id: `INV-2026-0${localSchoolFees.length + 1}`,
        ...data,
      };
      localSchoolFees = [newInvoice, ...localSchoolFees];
      return newInvoice;
    } catch (error) {
      throw error;
    }
  },

  async markSchoolFeePaid(id) {
    try {
      // return await api.patch(`/school/fees/${id}/pay`);
      localSchoolFees = localSchoolFees.map((f) =>
        f.id === id ? { ...f, status: 'Paid', method: 'UPI / NetBanking' } : f
      );
      return localSchoolFees.find((f) => f.id === id);
    } catch (error) {
      throw error;
    }
  },

  // --- COLLEGE FEES ---
  async getCollegeFees(params = {}) {
    try {
      // return await api.get('/college/fees', { params });
      return [...localCollegeFees];
    } catch (error) {
      return [...localCollegeFees];
    }
  },

  async createCollegeFee(data) {
    try {
      // return await api.post('/college/fees', data);
      const newFee = {
        id: `COL-INV-0${localCollegeFees.length + 1}`,
        ...data,
      };
      localCollegeFees = [newFee, ...localCollegeFees];
      return newFee;
    } catch (error) {
      throw error;
    }
  },

  async markCollegeFeePaid(id) {
    try {
      // return await api.patch(`/college/fees/${id}/pay`);
      localCollegeFees = localCollegeFees.map((f) => (f.id === id ? { ...f, status: 'Paid' } : f));
      return localCollegeFees.find((f) => f.id === id);
    } catch (error) {
      throw error;
    }
  },

  // --- UNIVERSITY FEES ---
  async getUniversityFees(params = {}) {
    try {
      // return await api.get('/university/fees', { params });
      return [...localUniversityFees];
    } catch (error) {
      return [...localUniversityFees];
    }
  },

  async createUniversityFee(data) {
    try {
      // return await api.post('/university/fees', data);
      const newAcc = {
        id: `UNIV-FEE-0${localUniversityFees.length + 1}`,
        ...data,
      };
      localUniversityFees = [newAcc, ...localUniversityFees];
      return newAcc;
    } catch (error) {
      throw error;
    }
  },

  async markUniversityFeePaid(id) {
    try {
      // return await api.patch(`/university/fees/${id}/pay`);
      localUniversityFees = localUniversityFees.map((a) => (a.id === id ? { ...a, status: 'Paid' } : a));
      return localUniversityFees.find((a) => a.id === id);
    } catch (error) {
      throw error;
    }
  },
};

export default feeService;
