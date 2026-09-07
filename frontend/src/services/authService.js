import api from './api';

const DEFAULT_USERS = {
  'super-admin': {
    id: 'USR-SA-01',
    name: 'Vikramaditya Mehta',
    email: 'admin@edusys-corp.in',
    role: 'super-admin',
    roleLabel: 'Super Admin',
    institutionName: 'Apex Central Systems',
    institutionType: 'System Wide',
    avatar: 'VM',
    token: 'mock-jwt-super-admin-token',
  },
  'school': {
    id: 'USR-SCH-01',
    name: 'Dr. Rajesh Sharma',
    email: 'principal@dpis-delhi.edu.in',
    role: 'school',
    roleLabel: 'School Administrator',
    institutionName: 'Delhi Public International School',
    institutionType: 'School',
    avatar: 'RS',
    token: 'mock-jwt-school-token',
  },
  'college': {
    id: 'USR-COL-01',
    name: 'Prof. Sunita Rao',
    email: 'dean@heritagevalley.ac.in',
    role: 'college',
    roleLabel: 'College Principal & Dean',
    institutionName: 'Heritage Valley College of Engineering',
    institutionType: 'College',
    avatar: 'SR',
    token: 'mock-jwt-college-token',
  },
  'university': {
    id: 'USR-UNIV-01',
    name: 'Prof. Dr. K. Ramanathan',
    email: 'vc@apex-university.ac.in',
    role: 'university',
    roleLabel: 'University Vice Chancellor',
    institutionName: 'Apex Central University of Science & Tech',
    institutionType: 'University',
    avatar: 'KR',
    token: 'mock-jwt-university-token',
  },
};

export const authService = {
  async login(role, credentials = {}) {
    try {
      // Future API integration:
      // const response = await api.post('/auth/login', { role, ...credentials });
      // return response.data;
      const user = { ...(DEFAULT_USERS[role] || DEFAULT_USERS['super-admin']), ...credentials, role };
      localStorage.setItem('educrm_user', JSON.stringify(user));
      localStorage.setItem('educrm_auth', 'true');
      localStorage.setItem('educrm_token', user.token || 'mock-token');
      return user;
    } catch (error) {
      console.warn('Backend login endpoint unavailable, using mock session', error);
      const user = { ...(DEFAULT_USERS[role] || DEFAULT_USERS['super-admin']), ...credentials, role };
      localStorage.setItem('educrm_user', JSON.stringify(user));
      localStorage.setItem('educrm_auth', 'true');
      return user;
    }
  },

  async logout() {
    try {
      // await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('educrm_user');
      localStorage.setItem('educrm_auth', 'false');
      localStorage.removeItem('educrm_token');
    }
  },

  getCurrentUser() {
    const saved = localStorage.getItem('educrm_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return DEFAULT_USERS['super-admin'];
  },

  isAuthenticated() {
    const authFlag = localStorage.getItem('educrm_auth');
    return authFlag !== 'false';
  },

  switchRole(role) {
    return this.login(role);
  },
};

export default authService;
