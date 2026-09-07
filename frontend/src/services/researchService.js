import api from './api';
import { mockResearchProjects, mockResearchers } from '../mock/mockResearch';

let localProjects = [...mockResearchProjects];
let localResearchers = [...mockResearchers];

export const researchService = {
  // --- RESEARCH PROJECTS ---
  async getResearchProjects(params = {}) {
    try {
      // return await api.get('/university/research-projects', { params });
      return [...localProjects];
    } catch (error) {
      return [...localProjects];
    }
  },

  async createResearchProject(data) {
    try {
      // return await api.post('/university/research-projects', data);
      const newPrj = {
        ...data,
        id: `RES-PRJ-00${localProjects.length + 1}`,
      };
      localProjects = [newPrj, ...localProjects];
      return newPrj;
    } catch (error) {
      throw error;
    }
  },

  async updateResearchProject(id, data) {
    try {
      // return await api.put(`/university/research-projects/${id}`, data);
      localProjects = localProjects.map((p) => (p.id === id ? { ...p, ...data } : p));
      return localProjects.find((p) => p.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteResearchProject(id) {
    try {
      // return await api.delete(`/university/research-projects/${id}`);
      localProjects = localProjects.filter((p) => p.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },

  // --- DOCTORAL RESEARCHERS & SCHOLARS ---
  async getResearchers(params = {}) {
    try {
      // return await api.get('/university/researchers', { params });
      return [...localResearchers];
    } catch (error) {
      return [...localResearchers];
    }
  },

  async createResearcher(data) {
    try {
      // return await api.post('/university/researchers', data);
      const newRsc = {
        ...data,
        id: `RSC-00${localResearchers.length + 1}`,
      };
      localResearchers = [...localResearchers, newRsc];
      return newRsc;
    } catch (error) {
      throw error;
    }
  },

  async deleteResearcher(id) {
    try {
      // return await api.delete(`/university/researchers/${id}`);
      localResearchers = localResearchers.filter((r) => r.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default researchService;
