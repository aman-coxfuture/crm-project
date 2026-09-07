import api from './api';
import { mockCollegeDepartments } from '../mock/mockDepartments';

let localDepartments = [...mockCollegeDepartments];

export const departmentService = {
  async getCollegeDepartments(params = {}) {
    try {
      // return await api.get('/college/departments', { params });
      return [...localDepartments];
    } catch (error) {
      return [...localDepartments];
    }
  },

  async createCollegeDepartment(data) {
    try {
      // return await api.post('/college/departments', data);
      const newDept = {
        id: `DEPT-${(data.code || 'GEN').toUpperCase()}`,
        ...data,
      };
      localDepartments = [...localDepartments, newDept];
      return newDept;
    } catch (error) {
      throw error;
    }
  },

  async updateCollegeDepartment(id, data) {
    try {
      // return await api.put(`/college/departments/${id}`, data);
      localDepartments = localDepartments.map((d) => (d.id === id ? { ...d, ...data } : d));
      return localDepartments.find((d) => d.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteCollegeDepartment(id) {
    try {
      // return await api.delete(`/college/departments/${id}`);
      localDepartments = localDepartments.filter((d) => d.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default departmentService;
