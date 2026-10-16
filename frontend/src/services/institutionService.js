import api from "./api";
import {
  mockInstitutions,
  mockUniversityColleges,
} from "../mock/mockInstitutions";

let localInstitutions = [...mockInstitutions];
let localColleges = [...mockUniversityColleges];

export const institutionService = {
  async getInstitutions(params = {}) {
    const response = await api.get("/tenants", { params });

    return (response.tenants || []).map((tenant) => ({
      ...tenant,
      id: tenant._id,
      schoolCode: tenant.code || "—",
      status: tenant.status === "ACTIVE" ? "Active" : "Inactive",
      board: tenant.board || "—",
      email: tenant.email || "—",
      phone: tenant.phone || "—",
      address: tenant.address || "—",
      studentsCount: tenant.students || 0,
      teachersCount: tenant.faculty || 0,
      staffCount: tenant.staff || 0,
      createdDate: tenant.createdAt ? tenant.createdAt.split("T")[0] : "",
    }));
  },

  async getTenantStats() {
    const response = await api.get("/tenants/stats");
    return response.stats;
  },

  async getInstitutionById(id) {
    const institutions = await this.getInstitutions();

    return institutions.find((institution) => institution.id === id) || null;
  },

  async createInstitution(data) {
    const response = await api.post("/tenants", {
      name: data.name,
      code: data.code,
      type: "SCHOOL",
      email: data.email,
      phone: data.phone,
      address: data.address,
      board: data.board,
      adminName: data.adminName,
      adminEmail: data.adminEmail,
      adminPassword: data.adminPassword,
    });

    const tenant = response.tenant;

    return {
      ...tenant,
      id: tenant.id || tenant._id,
      status: tenant.status === "ACTIVE" ? "Active" : "Inactive",
      createdDate: tenant.createdAt ? tenant.createdAt.split("T")[0] : "",
      students: 0,
      faculty: 0,
    };
  },

  async updateInstitution(id, data) {
    const response = await api.put(`/tenants/${id}`, {
      name: data.name,
      code: data.code,
      email: data.email,
      phone: data.phone,
      address: data.address,
      board: data.board,
    });

    const tenant = response.tenant;

    return {
      ...tenant,
      id: tenant.id || tenant._id,
      status: tenant.status === "ACTIVE" ? "Active" : "Inactive",
      createdDate: tenant.createdAt ? tenant.createdAt.split("T")[0] : "",
      students: tenant.students || 0,
      faculty: tenant.faculty || 0,
    };
  },

  async getInstitutionAdmin(id) {
    const response = await api.get(`/tenants/${id}/admin`);
    return response.admin;
  },

  async updateInstitutionAdmin(id, data) {
    const response = await api.put(`/tenants/${id}/admin`, {
      name: data.name,
      email: data.email,
      password: data.password,
      isActive: data.isActive,
    });

    return response.admin;
  },

  async deleteInstitution(id) {
    return await api.delete(`/tenants/${id}`);
  },

  async toggleStatus(id, currentStatus) {
    if (currentStatus === "Active") {
      return await api.delete(`/tenants/${id}`);
    }

    return await api.patch(`/tenants/${id}/reactivate`);
  },
  // University Affiliated / Constituent Colleges
  async getUniversityColleges() {
    try {
      // return await api.get('/university/colleges');
      return [...localColleges];
    } catch (error) {
      return [...localColleges];
    }
  },

  async createUniversityCollege(data) {
    try {
      // return await api.post('/university/colleges', data);
      const newCol = {
        ...data,
        id: `UNIV-COL-00${localColleges.length + 1}`,
      };
      localColleges = [newCol, ...localColleges];
      return newCol;
    } catch (error) {
      throw error;
    }
  },

  async updateUniversityCollege(id, data) {
    try {
      // return await api.put(`/university/colleges/${id}`, data);
      localColleges = localColleges.map((c) =>
        c.id === id ? { ...c, ...data } : c,
      );
      return localColleges.find((c) => c.id === id);
    } catch (error) {
      throw error;
    }
  },

  async deleteUniversityCollege(id) {
    try {
      // return await api.delete(`/university/colleges/${id}`);
      localColleges = localColleges.filter((c) => c.id !== id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  },
};

export default institutionService;
