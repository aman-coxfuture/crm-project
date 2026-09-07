import api from './api';
import { mockUsers } from '../mock/mockUsers';

let localUsers = [...mockUsers];

export const userService = {
  async getUsers(params = {}) {
    try {
      // return await api.get('/users', { params });
      return [...localUsers];
    } catch (error) {
      return [...localUsers];
    }
  },

  async getUserById(id) {
    try {
      // return await api.get(`/users/${id}`);
      return localUsers.find((u) => u.id === id) || null;
    } catch (error) {
      return localUsers.find((u) => u.id === id) || null;
    }
  },

  async createUser(data) {
    try {
      // return await api.post('/users', data);
      const newUser = {
        ...data,
        id: `usr-00${localUsers.length + 1}`,
        lastLogin: 'Just now',
      };
      localUsers = [newUser, ...localUsers];
      return newUser;
    } catch (error) {
      throw error;
    }
  },

  async updateUser(id, data) {
    try {
      // return await api.put(`/users/${id}`, data);
      localUsers = localUsers.map((u) => (u.id === id ? { ...u, ...data } : u));
      return localUsers.find((u) => u.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      // return await api.delete(`/users/${id}`);
      localUsers = localUsers.filter((u) => u.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
