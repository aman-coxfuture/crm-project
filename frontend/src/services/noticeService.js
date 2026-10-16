import api from "./api";
import { mockNotices } from "../mock/mockNotices";

let localNotices = JSON.parse(JSON.stringify(mockNotices));

export const noticeService = {
  async getNoticesByRole(role) {
    const response = await api.get("/notices");

    return (response.notices || []).map((notice) => ({
      ...notice,
      id: notice._id,
      date: notice.createdAt
        ? new Date(notice.createdAt).toLocaleDateString("en-IN")
        : "—",
      status: notice.isActive ? "Active" : "Inactive",
    }));
  },

  async getSchoolNotices() {
    const response = await api.get("/notices");
    return response.notices || [];
  },

  async getCollegeNotices() {
    return this.getNoticesByRole("college");
  },

  async getUniversityNotices() {
    return this.getNoticesByRole("university");
  },

  async createNotice(role, data) {
    const response = await api.post("/notices", data);

    const notice = response.notice;

    return {
      ...notice,
      id: notice._id,
      date: notice.createdAt
        ? new Date(notice.createdAt).toLocaleDateString("en-IN")
        : "—",
      status: notice.isActive ? "Active" : "Inactive",
    };
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
