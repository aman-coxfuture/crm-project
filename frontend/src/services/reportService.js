import api from './api';
import {
  mockSuperAdminReports,
  mockSchoolReports,
  mockCollegeReports,
  mockUniversityReports,
} from '../mock/mockReports';

export const reportService = {
  async getSuperAdminReports() {
    try {
      // return await api.get('/super-admin/reports');
      return [...mockSuperAdminReports];
    } catch (error) {
      return [...mockSuperAdminReports];
    }
  },

  async getSchoolReports() {
    try {
      // return await api.get('/school/reports');
      return [...mockSchoolReports];
    } catch (error) {
      return [...mockSchoolReports];
    }
  },

  async getCollegeReports() {
    try {
      // return await api.get('/college/reports');
      return [...mockCollegeReports];
    } catch (error) {
      return [...mockCollegeReports];
    }
  },

  async getUniversityReports() {
    try {
      // return await api.get('/university/reports');
      return [...mockUniversityReports];
    } catch (error) {
      return [...mockUniversityReports];
    }
  },

  async generateReport(role, type) {
    try {
      // return await api.post(`/reports/generate`, { role, type });
      return {
        id: `REP-${Date.now().toString().slice(-4)}`,
        name: `Generated ${type || 'Consolidated'} Report`,
        generatedDate: new Date().toISOString().split('T')[0],
        status: 'Completed',
      };
    } catch (error) {
      return {
        id: `REP-${Date.now().toString().slice(-4)}`,
        name: `Generated ${type || 'Consolidated'} Report`,
        generatedDate: new Date().toISOString().split('T')[0],
        status: 'Completed',
      };
    }
  },
};

export default reportService;
