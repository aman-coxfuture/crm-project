import api from "./api";

export const settingsService = {
  async getSuperAdminSettings() {
    const response = await api.get("/settings/super-admin");

    return response?.data || response;
  },

  async updateSuperAdminSettings(data) {
    const response = await api.put("/settings/super-admin", data);

    return response?.data || response;
  },

  async getInstitutionSettings() {
    const response = await api.get("/settings/institution");

    return response?.data || response;
  },

  async updateInstitutionSettings(data) {
    const response = await api.put("/settings/institution", data);

    return response?.data || response;
  },
};

export default settingsService;
