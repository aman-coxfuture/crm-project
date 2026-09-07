import api from './api';
import { mockNotices } from '../mock/mockNotices';

let localNotices = JSON.parse(JSON.stringify(mockNotices));

export const noticeService = {
  async getNoticesByRole(role) {
    try {
      // return await api.get(`/notices?role=${role}`);
      return localNotices[role] || localNotices['school'] || [];
    } catch (error) {
      return localNotices[role] || localNotices['school'] || [];
    }
  },

  async getSchoolNotices() {
    return this.getNoticesByRole('school');
  },

  async getCollegeNotices() {
    return this.getNoticesByRole('college');
  },

  async getUniversityNotices() {
    return this.getNoticesByRole('university');
  },

  async createNotice(role, data) {
    try {
      // return await api.post('/notices', { role, ...data });
      const newNotice = {
        id: `NOT-${(role || 'SCH').substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        ...data,
      };
      if (!localNotices[role]) localNotices[role] = [];
      localNotices[role] = [newNotice, ...localNotices[role]];
      return newNotice;
    } catch (error) {
      throw error;
    }
  },

  async deleteNotice(role, id) {
    try {
      // return await api.delete(`/notices/${id}`);
      if (localNotices[role]) {
        localNotices[role] = localNotices[role].filter((n) => n.id !== id);
      }
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default noticeService;
