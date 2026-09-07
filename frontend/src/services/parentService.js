import api from './api';
import { mockSchoolParents } from '../mock/mockParents';

let localParents = [...mockSchoolParents];

export const parentService = {
  async getSchoolParents(params = {}) {
    try {
      // return await api.get('/school/parents', { params });
      return [...localParents];
    } catch (error) {
      return [...localParents];
    }
  },

  async createSchoolParent(data) {
    try {
      // return await api.post('/school/parents', data);
      const newParent = {
        id: `PAR-00${localParents.length + 1}`,
        ...data,
      };
      localParents = [...localParents, newParent];
      return newParent;
    } catch (error) {
      throw error;
    }
  },

  async deleteSchoolParent(id) {
    try {
      // return await api.delete(`/school/parents/${id}`);
      localParents = localParents.filter((p) => p.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default parentService;
