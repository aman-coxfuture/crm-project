import api from "./api";

const superAdminAnalyticsService = {
  getAnalytics: async () => {
    const response = await api.get("/super-admin/analytics");
    return response?.data || response;
  },
};

export default superAdminAnalyticsService;
