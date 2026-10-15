import React, { useEffect, useState } from "react";

import transportService from "../../services/transportService";
import { useToast } from "../../context/ToastContext";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Tabs from "../../components/common/Tabs";
import StatCard from "../../components/common/StatCard";
import { FormInput, Select } from "../../components/common/FormInput";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Bus,
  Plus,
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  Navigation,
} from "lucide-react";

export default function TransportPage() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState("drivers");

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const loadTransportData = async () => {
      try {
        const [driversRes, vehiclesRes, routesRes] = await Promise.all([
          transportService.getDrivers(),
          transportService.getVehicles(),
          transportService.getRoutes(),
        ]);

        setDrivers(driversRes?.data || []);
        setVehicles(vehiclesRes?.data || []);
        setRoutes(routesRes?.data || []);
      } catch (error) {
        console.error("Transport API fetch failed:", error);
      }
    };

    loadTransportData();
  }, []);

  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);

  const [isEditDriverModalOpen, setIsEditDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: "",
    type: "",
    capacity: "",
    driver: "",
    insuranceExpiry: "",
    status: "Active",
  });

  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);

  const [newRoute, setNewRoute] = useState({
    name: "",
    driver: "",
    vehicle: "",
    totalStudents: 0,
    pickupTime: "",
    dropTime: "",
    stops: [],
    status: "Active",
  });

  const handleAddRouteSubmit = async (e) => {
    e.preventDefault();

    try {
      const routeData = {
        ...newRoute,
        totalStudents: Number(newRoute.totalStudents),
      };

      const response = await transportService.createRoute(routeData);

      setRoutes((prev) => [...prev, response.data]);

      setNewRoute({
        name: "",
        driver: "",
        vehicle: "",
        totalStudents: 0,
        pickupTime: "",
        dropTime: "",
        stops: [],
        status: "Active",
      });

      setIsAddRouteModalOpen(false);

      alert("Route added successfully!");
    } catch (error) {
      console.error("Error adding route:", error);
      alert(error?.response?.data?.message || "Failed to add route");
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle({
      ...vehicle,
      insuranceExpiry: vehicle.insuranceExpiry
        ? new Date(vehicle.insuranceExpiry).toISOString().split("T")[0]
        : "",
    });

    setIsEditVehicleModalOpen(true);
  };

  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    vehicleNumber: "",
    vehicleType: "",
    route: "",
    assignedStudents: 0,
    joiningDate: "",
    status: "Active",
  });
  const handleAddDriverSubmit = async (e) => {
    e.preventDefault();

    try {
      const driverData = {
        name: newDriver.name,
        phone: newDriver.phone,
        licenseNumber: newDriver.licenseNumber,
        vehicleNumber: newDriver.vehicleNumber,
        vehicleType: newDriver.vehicleType,
        route: newDriver.route,
        assignedStudents: Number(newDriver.assignedStudents) || 0,
        joiningDate: newDriver.joiningDate || undefined,
        status: newDriver.status || "Active",
      };

      const response = await transportService.createDriver(driverData);

      if (response?.success) {
        // Add newly created driver to current UI
        setDrivers((prev) => [...prev, response.data]);

        // Reset form
        setNewDriver({
          name: "",
          phone: "",
          licenseNumber: "",
          vehicleNumber: "",
          vehicleType: "",
          route: "",
          assignedStudents: 0,
          joiningDate: "",
          status: "Active",
        });

        setIsAddDriverModalOpen(false);

        alert("Driver added successfully");
      } else {
        alert(response?.message || "Failed to add driver");
      }
    } catch (error) {
      console.error("Create driver error:", error);

      alert(error?.message || "Failed to add driver");
    }
  };

  const handleEditDriver = (driver) => {
    setEditingDriver({
      ...driver,
      joiningDate: driver.joiningDate
        ? new Date(driver.joiningDate).toISOString().split("T")[0]
        : "",
    });

    setIsEditDriverModalOpen(true);
  };

  const handleDeactivateDriver = async (driver) => {
    try {
      const driverId = driver._id || driver.id;

      const response = await transportService.deactivateDriver(driverId);

      if (response?.success) {
        setDrivers((prev) =>
          prev.map((item) =>
            (item._id || item.id) === driverId
              ? {
                  ...item,
                  status: "Inactive",
                }
              : item,
          ),
        );

        alert("Driver deactivated successfully");
      } else {
        alert(response?.message || "Failed to deactivate driver");
      }
    } catch (error) {
      console.error("Deactivate driver error:", error);
      alert(error?.message || "Failed to deactivate driver");
    }
  };

  const handleReactivateDriver = async (driver) => {
    try {
      const driverId = driver._id || driver.id;

      const response = await transportService.reactivateDriver(driverId);

      if (response?.success) {
        setDrivers((prev) =>
          prev.map((item) =>
            (item._id || item.id) === driverId
              ? {
                  ...item,
                  status: "Active",
                }
              : item,
          ),
        );

        alert("Driver reactivated successfully");
      } else {
        alert(response?.message || "Failed to reactivate driver");
      }
    } catch (error) {
      console.error("Reactivate driver error:", error);
      alert(error?.message || "Failed to reactivate driver");
    }
  };

  const driverColumns = [
    {
      header: "Driver Name & ID",
      accessor: "name",
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {val}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            ID: {row.driverId} • License: {row.licenseNumber}
          </div>
        </div>
      ),
    },
    {
      header: "Assigned Vehicle",
      accessor: "vehicleNumber",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="badge badge-primary">{val}</span>
          <div
            style={{
              fontSize: "0.725rem",
              color: "var(--text-tertiary)",
              marginTop: "2px",
            }}
          >
            {row.vehicleType}
          </div>
        </div>
      ),
    },
    {
      header: "Route",
      accessor: "route",
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: "Phone Contact",
      accessor: "phone",
    },
    {
      header: "Students Onboard",
      accessor: "assignedStudents",
      sortable: true,
      render: (val) => <strong>{val} Students</strong>,
    },
    {
      header: "Status",
      accessor: "status",
      isStatus: true,
      sortable: true,
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (val, row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleEditDriver(row)}
            className="btn btn-secondary"
          >
            Edit
          </button>

          {row.status === "Active" ? (
            <button
              type="button"
              onClick={() => handleDeactivateDriver(row)}
              className="btn btn-secondary"
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleReactivateDriver(row)}
              className="btn btn-secondary"
            >
              Reactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bus size={26} color="var(--primary)" />
            School Fleet & Transport Logistics
          </h1>
          <p className="page-subtitle">
            Manage certified drivers, bus routes, fleet maintenance and student
            pickups
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            if (activeTab === "vehicles") {
              setIsAddVehicleModalOpen(true);
            } else if (activeTab === "routes") {
              setIsAddRouteModalOpen(true);
            } else {
              setIsAddDriverModalOpen(true);
            }
          }}
        >
          <Plus size={16} />
          <span>
            {activeTab === "vehicles"
              ? "Add Vehicle"
              : activeTab === "routes"
                ? "Add Route"
                : "Add Fleet Driver"}
          </span>
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: "24px" }}>
        <StatCard
          title="Total Drivers"
          value={drivers.length}
          icon={Users}
          color="indigo"
          subtitle="All licensed"
        />
        <StatCard
          title="Total Vehicles"
          value={vehicles.length}
          icon={Bus}
          color="sky"
          subtitle={`${vehicles.filter((v) => v.type?.toLowerCase().includes("bus")).length} Buses, ${vehicles.filter((v) => v.type?.toLowerCase().includes("van")).length} Vans`}
        />
        <StatCard
          title="Daily Bus Routes"
          value={routes.length}
          icon={Navigation}
          color="emerald"
          subtitle={`Covering ${routes.reduce(
            (total, route) => total + (route.stops?.length || 0),
            0,
          )} stops`}
        />
      </div>

      <Tabs
        tabs={[
          {
            id: "drivers",
            label: "School Drivers",
            icon: <Users size={15} />,
          },
          {
            id: "routes",
            label: "Bus Routes & Stops",
            icon: <MapPin size={15} />,
          },
          {
            id: "vehicles",
            label: "Vehicle Fleet Registry",
            icon: <Bus size={15} />,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {activeTab === "drivers" && (
        <DataTable
          title="Fleet Drivers"
          subtitle="Certified transport personnel"
          columns={driverColumns}
          data={drivers}
          searchKeys={["name", "driverId", "phone", "licenseNumber", "route"]}
        />
      )}

      {activeTab === "routes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {routes.map((r) => (
            <div key={r._id || r.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{r.name}</h3>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    Driver: <strong>{r.driver}</strong> • Vehicle:{" "}
                    <strong>{r.vehicle}</strong> • {r.totalStudents} Students
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="badge badge-success">
                    Pickup: {r.pickupTime}
                  </span>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                      marginTop: "4px",
                    }}
                  >
                    Drop: {r.dropTime}
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Designated Bus Stops
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {r.stops?.map((stop, i) => (
                    <span
                      key={i}
                      className="badge badge-primary"
                      style={{ padding: "6px 12px" }}
                    >
                      <MapPin size={12} /> {i + 1}. {stop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "vehicles" && (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div
            className="table-container"
            style={{ border: "none", borderRadius: "0" }}
          >
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Vehicle Type</th>
                  <th>Seating Capacity</th>
                  <th>Assigned Driver</th>
                  <th>Insurance Valid Until</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id || v.id}>
                    <td>
                      <strong>{v.vehicleNumber}</strong>
                    </td>
                    <td>
                      <span className="badge badge-primary">{v.type}</span>
                    </td>
                    <td>
                      <strong>{v.capacity} Seats</strong>
                    </td>
                    <td>{v.driver}</td>
                    <td>{v.insuranceExpiry}</td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleEditVehicle(v)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      <Modal
        isOpen={isAddDriverModalOpen}
        onClose={() => setIsAddDriverModalOpen(false)}
        title="Register Fleet Driver"
        subtitle="Onboard transport driver into the school fleet"
      >
        <form onSubmit={handleAddDriverSubmit}>
          <FormInput
            label="Driver Full Name"
            required
            value={newDriver.name}
            onChange={(e) =>
              setNewDriver({ ...newDriver, name: e.target.value })
            }
            placeholder="e.g. Thomas Wayne"
          />
          <div className="grid-2">
            <FormInput
              label="Contact Phone"
              value={newDriver.phone}
              onChange={(e) =>
                setNewDriver({ ...newDriver, phone: e.target.value })
              }
              placeholder="+1 (555) 901-0000"
            />
            <FormInput
              label="Driver License #"
              value={newDriver.licenseNumber}
              onChange={(e) =>
                setNewDriver({ ...newDriver, licenseNumber: e.target.value })
              }
              placeholder="DL-NY-9918231"
            />
          </div>

          <div className="grid-2">
            <Select
              label="Assigned Route"
              value={newDriver.route}
              onChange={(e) =>
                setNewDriver({ ...newDriver, route: e.target.value })
              }
              options={routes.map((route) => route.name)}
            />
            <FormInput
              label="Assigned Vehicle Plate"
              value={newDriver.vehicleNumber}
              onChange={(e) =>
                setNewDriver({ ...newDriver, vehicleNumber: e.target.value })
              }
            />
          </div>

          <div
            className="modal-footer"
            style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddDriverModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Driver
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAddRouteModalOpen}
        onClose={() => {
          setIsAddRouteModalOpen(false);
          setNewRoute({
            name: "",
            driver: "",
            vehicle: "",
            totalStudents: 0,
            pickupTime: "",
            dropTime: "",
            stops: [],
            status: "Active",
          });
        }}
        title="Add Route"
      >
        <form onSubmit={handleAddRouteSubmit}>
          <FormInput
            label="Route Name"
            value={newRoute.name}
            onChange={(e) =>
              setNewRoute({
                ...newRoute,
                name: e.target.value,
              })
            }
            required
          />

          <Select
            label="Assigned Driver"
            value={newRoute.driver}
            onChange={(e) =>
              setNewRoute({
                ...newRoute,
                driver: e.target.value,
              })
            }
            options={drivers.map((driver) => ({
              label: driver.name,
              value: driver.name,
            }))}
          />

          <Select
            label="Assigned Vehicle"
            value={newRoute.vehicle}
            onChange={(e) =>
              setNewRoute({
                ...newRoute,
                vehicle: e.target.value,
              })
            }
            options={vehicles.map((vehicle) => ({
              label: vehicle.vehicleNumber,
              value: vehicle.vehicleNumber,
            }))}
          />

          <FormInput
            label="Total Students"
            type="number"
            value={newRoute.totalStudents}
            onChange={(e) =>
              setNewRoute({
                ...newRoute,
                totalStudents: e.target.value,
              })
            }
            min="0"
          />

          <FormInput
            label="Pickup Time"
            type="time"
            value={newRoute.pickupTime}
            onChange={(e) =>
              setNewRoute({
                ...newRoute,
                pickupTime: e.target.value,
              })
            }
          />

          <FormInput
            label="Drop Time"
            type="time"
            value={newRoute.dropTime}
            onChange={(e) =>
              setNewRoute({
                ...newRoute,
                dropTime: e.target.value,
              })
            }
          />

          <FormInput
            label="Bus Stops"
            value={newRoute.stops.join(", ")}
            onChange={(e) =>
              setNewRoute({
                ...newRoute,
                stops: e.target.value
                  .split(",")
                  .map((stop) => stop.trim())
                  .filter(Boolean),
              })
            }
            placeholder="e.g. Sector 18, City Center, Alpha 1, Pari Chowk"
          />

          <Select
            label="Status"
            value={newRoute.status}
            onChange={(e) =>
              setNewRoute({
                ...newRoute,
                status: e.target.value,
              })
            }
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddRouteModalOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Add Route
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isAddVehicleModalOpen}
        onClose={() => {
          setIsAddVehicleModalOpen(false);
          setNewVehicle({
            vehicleNumber: "",
            type: "",
            capacity: "",
            driver: "",
            insuranceExpiry: "",
            status: "Active",
          });
        }}
        title="Register Fleet Vehicle"
        subtitle="Add a vehicle to the school transport fleet"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            try {
              const vehicleData = {
                vehicleNumber: newVehicle.vehicleNumber,
                type: newVehicle.type,
                capacity: Number(newVehicle.capacity) || 0,
                driver: newVehicle.driver,
                insuranceExpiry: newVehicle.insuranceExpiry || undefined,
                status: newVehicle.status || "Active",
              };

              const response =
                await transportService.createVehicle(vehicleData);

              if (response?.success) {
                setVehicles((prev) => [...prev, response.data]);

                setNewVehicle({
                  vehicleNumber: "",
                  type: "",
                  capacity: "",
                  driver: "",
                  insuranceExpiry: "",
                  status: "Active",
                });

                setIsAddVehicleModalOpen(false);

                alert("Vehicle added successfully");
              } else {
                alert(response?.message || "Failed to add vehicle");
              }
            } catch (error) {
              console.error("Create vehicle error:", error);

              alert(error?.message || "Failed to add vehicle");
            }
          }}
        >
          <div className="grid-2">
            <FormInput
              label="Vehicle Number"
              required
              value={newVehicle.vehicleNumber}
              onChange={(e) =>
                setNewVehicle({
                  ...newVehicle,
                  vehicleNumber: e.target.value,
                })
              }
              placeholder="e.g. BUS-105"
            />

            <FormInput
              label="Vehicle Type"
              required
              value={newVehicle.type}
              onChange={(e) =>
                setNewVehicle({
                  ...newVehicle,
                  type: e.target.value,
                })
              }
              placeholder="e.g. Heavy Bus (52-Seater)"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Seating Capacity"
              required
              type="number"
              value={newVehicle.capacity}
              onChange={(e) =>
                setNewVehicle({
                  ...newVehicle,
                  capacity: e.target.value,
                })
              }
              placeholder="e.g. 52"
            />

            <Select
              label="Assigned Driver"
              value={newVehicle.driver}
              onChange={(e) =>
                setNewVehicle({
                  ...newVehicle,
                  driver: e.target.value,
                })
              }
              options={drivers.map((driver) => driver.name)}
            />
          </div>

          <FormInput
            label="Insurance Valid Until"
            type="date"
            value={newVehicle.insuranceExpiry}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                insuranceExpiry: e.target.value,
              })
            }
          />

          <Select
            label="Status"
            value={newVehicle.status}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                status: e.target.value,
              })
            }
            options={["Active", "Inactive"]}
          />

          <div
            className="modal-footer"
            style={{
              margin: "20px -24px -24px",
              padding: "16px 24px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsAddVehicleModalOpen(false);
                setNewVehicle({
                  vehicleNumber: "",
                  type: "",
                  capacity: "",
                  driver: "",
                  insuranceExpiry: "",
                  status: "Active",
                });
              }}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Add Vehicle
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        isOpen={isEditVehicleModalOpen}
        onClose={() => {
          setIsEditVehicleModalOpen(false);
          setEditingVehicle(null);
        }}
        title="Edit Fleet Vehicle"
        subtitle="Update vehicle details"
      >
        {editingVehicle && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              try {
                const vehicleId = editingVehicle._id || editingVehicle.id;

                const vehicleData = {
                  vehicleNumber: editingVehicle.vehicleNumber,
                  type: editingVehicle.type,
                  capacity: Number(editingVehicle.capacity) || 0,
                  driver: editingVehicle.driver,
                  insuranceExpiry: editingVehicle.insuranceExpiry || undefined,
                  status: editingVehicle.status || "Active",
                };

                const response = await transportService.updateVehicle(
                  vehicleId,
                  vehicleData,
                );

                if (response?.success) {
                  setVehicles((prev) =>
                    prev.map((vehicle) =>
                      (vehicle._id || vehicle.id) === vehicleId
                        ? response.data
                        : vehicle,
                    ),
                  );

                  setIsEditVehicleModalOpen(false);
                  setEditingVehicle(null);

                  alert("Vehicle updated successfully");
                } else {
                  alert(response?.message || "Failed to update vehicle");
                }
              } catch (error) {
                console.error("Update vehicle error:", error);
                alert(error?.message || "Failed to update vehicle");
              }
            }}
          >
            <div className="grid-2">
              <FormInput
                label="Vehicle Number"
                required
                value={editingVehicle.vehicleNumber || ""}
                onChange={(e) =>
                  setEditingVehicle({
                    ...editingVehicle,
                    vehicleNumber: e.target.value,
                  })
                }
              />

              <FormInput
                label="Vehicle Type"
                required
                value={editingVehicle.type || ""}
                onChange={(e) =>
                  setEditingVehicle({
                    ...editingVehicle,
                    type: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid-2">
              <FormInput
                label="Seating Capacity"
                type="number"
                required
                value={editingVehicle.capacity ?? ""}
                onChange={(e) =>
                  setEditingVehicle({
                    ...editingVehicle,
                    capacity: e.target.value,
                  })
                }
              />

              <FormInput
                label="Assigned Driver"
                value={editingVehicle.driver || ""}
                onChange={(e) =>
                  setEditingVehicle({
                    ...editingVehicle,
                    driver: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid-2">
              <FormInput
                label="Insurance Expiry"
                type="date"
                value={editingVehicle.insuranceExpiry || ""}
                onChange={(e) =>
                  setEditingVehicle({
                    ...editingVehicle,
                    insuranceExpiry: e.target.value,
                  })
                }
              />

              <Select
                label="Status"
                value={editingVehicle.status || "Active"}
                onChange={(e) =>
                  setEditingVehicle({
                    ...editingVehicle,
                    status: e.target.value,
                  })
                }
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                  { label: "Maintenance", value: "Maintenance" },
                ]}
              />
            </div>

            <div
              className="modal-footer"
              style={{
                margin: "20px -24px -24px",
                padding: "16px 24px",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditVehicleModalOpen(false);
                  setEditingVehicle(null);
                }}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-primary">
                Update Vehicle
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Driver Modal */}
      <Modal
        isOpen={isEditDriverModalOpen}
        onClose={() => {
          setIsEditDriverModalOpen(false);
          setEditingDriver(null);
        }}
        title="Edit Fleet Driver"
        subtitle="Update transport driver details"
      >
        {editingDriver && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              try {
                const driverId = editingDriver._id || editingDriver.id;

                const updatedData = {
                  name: editingDriver.name,
                  phone: editingDriver.phone,
                  licenseNumber: editingDriver.licenseNumber,
                  vehicleNumber: editingDriver.vehicleNumber,
                  vehicleType: editingDriver.vehicleType,
                  route: editingDriver.route,
                  assignedStudents: Number(editingDriver.assignedStudents) || 0,
                  joiningDate: editingDriver.joiningDate || undefined,
                  status: editingDriver.status || "Active",
                };

                const response = await transportService.updateDriver(
                  driverId,
                  updatedData,
                );

                if (response?.success) {
                  setDrivers((prev) =>
                    prev.map((item) =>
                      (item._id || item.id) === driverId
                        ? { ...item, ...response.data }
                        : item,
                    ),
                  );

                  setIsEditDriverModalOpen(false);
                  setEditingDriver(null);

                  alert("Driver updated successfully");
                } else {
                  alert(response?.message || "Failed to update driver");
                }
              } catch (error) {
                console.error("Update driver error:", error);
                alert(error?.message || "Failed to update driver");
              }
            }}
          >
            <FormInput
              label="Driver Full Name"
              required
              value={editingDriver.name || ""}
              onChange={(e) =>
                setEditingDriver({
                  ...editingDriver,
                  name: e.target.value,
                })
              }
              placeholder="e.g. Thomas Wayne"
            />

            <div className="grid-2">
              <FormInput
                label="Contact Phone"
                value={editingDriver.phone || ""}
                onChange={(e) =>
                  setEditingDriver({
                    ...editingDriver,
                    phone: e.target.value,
                  })
                }
                placeholder="+1 (555) 901-0000"
              />

              <FormInput
                label="Driver License #"
                value={editingDriver.licenseNumber || ""}
                onChange={(e) =>
                  setEditingDriver({
                    ...editingDriver,
                    licenseNumber: e.target.value,
                  })
                }
                placeholder="DL-NY-9918231"
              />
            </div>

            <div className="grid-2">
              <Select
                label="Assigned Route"
                value={editingDriver.route || ""}
                onChange={(e) =>
                  setEditingDriver({
                    ...editingDriver,
                    route: e.target.value,
                  })
                }
                options={routes.map((route) => route.name)}
              />

              <FormInput
                label="Assigned Vehicle Plate"
                value={editingDriver.vehicleNumber || ""}
                onChange={(e) =>
                  setEditingDriver({
                    ...editingDriver,
                    vehicleNumber: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid-2">
              <FormInput
                label="Vehicle Type"
                value={editingDriver.vehicleType || ""}
                onChange={(e) =>
                  setEditingDriver({
                    ...editingDriver,
                    vehicleType: e.target.value,
                  })
                }
              />

              <FormInput
                label="Assigned Students"
                type="number"
                value={editingDriver.assignedStudents ?? 0}
                onChange={(e) =>
                  setEditingDriver({
                    ...editingDriver,
                    assignedStudents: e.target.value,
                  })
                }
              />
            </div>

            <FormInput
              label="Joining Date"
              type="date"
              value={editingDriver.joiningDate || ""}
              onChange={(e) =>
                setEditingDriver({
                  ...editingDriver,
                  joiningDate: e.target.value,
                })
              }
            />

            <div
              className="modal-footer"
              style={{
                margin: "20px -24px -24px",
                padding: "16px 24px",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditDriverModalOpen(false);
                  setEditingDriver(null);
                }}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-primary">
                Update Driver
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
