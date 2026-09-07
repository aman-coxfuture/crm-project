import api from './api';
import { mockMessages } from '../mock/mockMessages';

let localMessages = [...mockMessages];

export const messageService = {
  async getMessages() {
    try {
      // return await api.get('/messages');
      return [...localMessages];
    } catch (error) {
      return [...localMessages];
    }
  },

  async sendMessage(data) {
    try {
      // return await api.post('/messages', data);
      const newMsg = {
        id: `MSG-0${localMessages.length + 1}`,
        time: 'Just now',
        unread: false,
        ...data,
      };
      localMessages = [newMsg, ...localMessages];
      return newMsg;
    } catch (error) {
      throw error;
    }
  },
};

export default messageService;
