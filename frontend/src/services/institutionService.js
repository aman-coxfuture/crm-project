import api from './api';
import { mockInstitutions, mockUniversityColleges } from '../mock/mockInstitutions';

let localInstitutions = [...mockInstitutions];
let localColleges = [...mockUniversityColleges];

export const institutionService = {
  async getInstitutions(params = {}) {
    try {
      // Future API: return await api.get('/institutions', { params });
      return [...localInstitutions];
    } catch (error) {
      console.warn('API /institutions failed, using mock data');
      return [...localInstitutions];
    }
  },

  async getInstitutionById(id) {
    try {
      // return await api.get(`/institutions/${id}`);
      return localInstitutions.find((i) => i.id === id) || null;
    } catch (error) {
      return localInstitutions.find((i) => i.id === id) || null;
    }
  },

  async createInstitution(data) {
    try {
      // return await api.post('/institutions', data);
      const newInst = {
        ...data,
        id: `inst-00${localInstitutions.length + 1}`,
        code: data.code || `${data.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
        students: data.students || 0,
        faculty: data.faculty || 0,
        status: data.status || 'Active',
        createdDate: data.createdDate || new Date().toISOString().split('T')[0],
      };
      localInstitutions = [newInst, ...localInstitutions];
      return newInst;
    } catch (error) {
      throw error;
    }
  },

  async updateInstitution(id, data) {
    try {
      // return await api.put(`/institutions/${id}`, data);
      localInstitutions = localInstitutions.map((i) => (i.id === id ? { ...i, ...data } : i));
      return localInstitutions.find((i) => i.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteInstitution(id) {
    try {
      // return await api.delete(`/institutions/${id}`);
      localInstitutions = localInstitutions.filter((i) => i.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },

  async toggleStatus(id) {
    try {
      // return await api.patch(`/institutions/${id}/toggle-status`);
      const target = localInstitutions.find((i) => i.id === id);
      if (target) {
        target.status = target.status === 'Active' ? 'Inactive' : 'Active';
      }
      return target;
    } catch (error) {
      throw error;
    }
  },

  // University Affiliated / Constituent Colleges
  async getUniversityColleges() {
    try {
      // return await api.get('/university/colleges');
      return [...localColleges];
    } catch (error) {
      return [...localColleges];
    }
  },

  async createUniversityCollege(data) {
    try {
      // return await api.post('/university/colleges', data);
      const newCol = {
        ...data,
        id: `UNIV-COL-00${localColleges.length + 1}`,
      };
      localColleges = [newCol, ...localColleges];
      return newCol;
    } catch (error) {
      throw error;
    }
  },

  async updateUniversityCollege(id, data) {
    try {
      // return await api.put(`/university/colleges/${id}`, data);
      localColleges = localColleges.map((c) => (c.id === id ? { ...c, ...data } : c));
      return localColleges.find((c) => c.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteUniversityCollege(id) {
    try {
      // return await api.delete(`/university/colleges/${id}`);
      localColleges = localColleges.filter((c) => c.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default institutionService;
