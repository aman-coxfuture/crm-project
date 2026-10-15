import api from "./api";

const transportService = {
  // Drivers
  getDrivers: () => api.get("/transport/drivers"),

  createDriver: (data) => api.post("/transport/drivers", data),

  updateDriver: (id, data) => api.put(`/transport/drivers/${id}`, data),

  deactivateDriver: (id) => api.patch(`/transport/drivers/${id}/deactivate`),

  reactivateDriver: (id) => api.patch(`/transport/drivers/${id}/reactivate`),

  // Vehicles
  getVehicles: () => api.get("/transport/vehicles"),

  createVehicle: (data) => api.post("/transport/vehicles", data),

  updateVehicle: (id, data) => api.put(`/transport/vehicles/${id}`, data),

  // Routes
  getRoutes: () => api.get("/transport/routes"),

  createRoute: (data) => api.post("/transport/routes", data),
};

export default transportService;
