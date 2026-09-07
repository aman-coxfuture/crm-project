import api from './api';

let localSettings = {
  platformName: 'EduCRM Enterprise Platform',
  contactEmail: 'support@edusys-corp.in',
  sessionTimeout: '60',
  enable2FA: true,
  backupSchedule: 'Daily at 03:00 UTC',
  maintenanceMode: false,
};

let localInstitutionSettings = {
  academicYear: '2026-2027',
  currency: 'INR (₹)',
  emailAlerts: true,
  smsAlerts: true,
};

export const settingsService = {
  async getSuperAdminSettings() {
    try {
      // return await api.get('/settings/super-admin');
      return { ...localSettings };
    } catch (error) {
      return { ...localSettings };
    }
  },

  async updateSuperAdminSettings(data) {
    try {
      // return await api.put('/settings/super-admin', data);
      localSettings = { ...localSettings, ...data };
      return { ...localSettings };
    } catch (error) {
      localSettings = { ...localSettings, ...data };
      return { ...localSettings };
    }
  },

  async getInstitutionSettings() {
    try {
      // return await api.get('/settings/institution');
      return { ...localInstitutionSettings };
    } catch (error) {
      return { ...localInstitutionSettings };
    }
  },

  async updateInstitutionSettings(data) {
    try {
      // return await api.put('/settings/institution', data);
      localInstitutionSettings = { ...localInstitutionSettings, ...data };
      return { ...localInstitutionSettings };
    } catch (error) {
      localInstitutionSettings = { ...localInstitutionSettings, ...data };
      return { ...localInstitutionSettings };
    }
  },
};

export default settingsService;
