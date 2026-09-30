import api from "./api";

const staffFeeService = {
  getStaffFees: (params = {}) => api.get("/staff-fees", { params }),

  getStaffFeeById: (id) => api.get(`/staff-fees/${id}`),

  createStaffFee: (data) => api.post("/staff-fees", data),

  generateStaffFeeLedgers: (data) => api.post("/staff-fees/generate", data),

  updateStaffFee: (id, data) => api.put(`/staff-fees/${id}`, data),

  deactivateStaffFee: (id) => api.patch(`/staff-fees/${id}/deactivate`),

  recordStaffPayment: (data) => api.post("/staff-fees/payments", data),

  getStaffPaymentHistory: (params = {}) =>
    api.get("/staff-fees/payments/history", { params }),

  getEmployeePaymentHistory: (employeeId, params = {}) =>
    api.get(`/staff-fees/payments/employee/${employeeId}`, { params }),

  generateSalarySlip: (staffFeeId) =>
    api.post("/salary-slips/generate", { staffFeeId }),

  downloadSalarySlip: (id) =>
    api.get(`/salary-slips/${id}/download`, {
      responseType: "blob",
    }),

  getSalarySlips: (params = {}) => api.get("/salary-slips", { params }),
};

export default staffFeeService;
