import api from './api';
import { mockEvents } from '../mock/mockEvents';

let localEvents = JSON.parse(JSON.stringify(mockEvents));

export const eventService = {
  async getEventsByRole(role) {
    try {
      // return await api.get(`/events?role=${role}`);
      return localEvents[role] || localEvents['school'] || [];
    } catch (error) {
      return localEvents[role] || localEvents['school'] || [];
    }
  },

  async createEvent(role, data) {
    try {
      // return await api.post('/events', { role, ...data });
      const newEvent = {
        id: `EV-${Date.now().toString().slice(-4)}`,
        ...data,
      };
      if (!localEvents[role]) localEvents[role] = [];
      localEvents[role] = [newEvent, ...localEvents[role]];
      return newEvent;
    } catch (error) {
      throw error;
    }
  },

  async deleteEvent(role, id) {
    try {
      // return await api.delete(`/events/${id}`);
      if (localEvents[role]) {
        localEvents[role] = localEvents[role].filter((e) => e.id !== id);
      }
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default eventService;
