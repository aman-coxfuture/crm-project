import api from './api';
import {
  mockSuperAdminStats,
  mockSuperAdminGrowthData,
  mockSuperAdminRecentActivities,
  mockSchoolStats,
  mockSchoolProfile,
  mockCollegeStats,
  mockCollegeProfile,
  mockUniversityStats,
  mockUniversityProfile,
} from '../mock/mockAnalytics';

export const analyticsService = {
  async getSuperAdminAnalytics() {
    try {
      // return await api.get('/analytics/super-admin');
      return {
        stats: { ...mockSuperAdminStats },
        growthData: [...mockSuperAdminGrowthData],
        recentActivities: [...mockSuperAdminRecentActivities],
      };
    } catch (error) {
      return {
        stats: { ...mockSuperAdminStats },
        growthData: [...mockSuperAdminGrowthData],
        recentActivities: [...mockSuperAdminRecentActivities],
      };
    }
  },

  async getSchoolDashboardData() {
    try {
      // return await api.get('/analytics/school');
      return {
        stats: { ...mockSchoolStats },
        profile: { ...mockSchoolProfile },
      };
    } catch (error) {
      return {
        stats: { ...mockSchoolStats },
        profile: { ...mockSchoolProfile },
      };
    }
  },

  async getCollegeDashboardData() {
    try {
      // return await api.get('/analytics/college');
      return {
        stats: { ...mockCollegeStats },
        profile: { ...mockCollegeProfile },
      };
    } catch (error) {
      return {
        stats: { ...mockCollegeStats },
        profile: { ...mockCollegeProfile },
      };
    }
  },

  async getUniversityDashboardData() {
    try {
      // return await api.get('/analytics/university');
      return {
        stats: { ...mockUniversityStats },
        profile: { ...mockUniversityProfile },
      };
    } catch (error) {
      return {
        stats: { ...mockUniversityStats },
        profile: { ...mockUniversityProfile },
      };
    }
  },
};

export default analyticsService;
