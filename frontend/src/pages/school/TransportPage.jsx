import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import StatCard from '../../components/common/StatCard';
import { FormInput, Select } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Bus, Plus, Users, MapPin, Phone, ShieldCheck, Navigation } from 'lucide-react';

export default function TransportPage() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState('drivers');

  const [drivers, setDrivers] = useState(() => schoolDataService.getDrivers());
  const [vehicles] = useState(() => schoolDataService.getVehicles());
  const [routes] = useState(() => schoolDataService.getRoutes());

  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    vehicleNumber: 'BUS-101',
    vehicleType: 'Heavy Bus (52-Seater)',
    route: 'Route 1 - North Express',
    assignedStudents: 35,
  });

  const handleAddDriverSubmit = (e) => {
    e.preventDefault();
    if (!newDriver.name) return;
    const created = schoolDataService.addDriver(newDriver);
    setDrivers(schoolDataService.getDrivers());
    setIsAddDriverModalOpen(false);
    success(`Driver ${created.name} added to school fleet!`);
  };

  const driverColumns = [
    {
      header: 'Driver Name & ID',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {row.driverId} • License: {row.licenseNumber}</div>
        </div>
      ),
    },
    {
      header: 'Assigned Vehicle',
      accessor: 'vehicleNumber',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="badge badge-primary">{val}</span>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{row.vehicleType}</div>
        </div>
      ),
    },
    {
      header: 'Route',
      accessor: 'route',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Phone Contact',
      accessor: 'phone',
    },
    {
      header: 'Students Onboard',
      accessor: 'assignedStudents',
      sortable: true,
      render: (val) => <strong>{val} Students</strong>,
    },
    {
      header: 'Status',
      accessor: 'status',
      isStatus: true,
      sortable: true,
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
            Manage certified drivers, bus routes, fleet maintenance and student pickups
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddDriverModalOpen(true)}>
          <Plus size={16} />
          <span>Add Fleet Driver</span>
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard title="Total Drivers" value={drivers.length} icon={Users} color="indigo" subtitle="All licensed" />
        <StatCard title="Total Vehicles" value={vehicles.length} icon={Bus} color="sky" subtitle="3 Buses, 1 Mini Van" />
        <StatCard title="Daily Bus Routes" value={routes.length} icon={Navigation} color="emerald" subtitle="Covering 14 stops" />
      </div>

      <Tabs
        tabs={[
          { id: 'drivers', label: 'School Drivers', icon: <Users size={15} /> },
          { id: 'routes', label: 'Bus Routes & Stops', icon: <MapPin size={15} /> },
          { id: 'vehicles', label: 'Vehicle Fleet Registry', icon: <Bus size={15} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {activeTab === 'drivers' && (
        <DataTable
          title="Fleet Drivers"
          subtitle="Certified transport personnel"
          columns={driverColumns}
          data={drivers}
          searchKeys={['name', 'driverId', 'phone', 'licenseNumber', 'route']}
        />
      )}

      {activeTab === 'routes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {routes.map((r) => (
            <div key={r.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{r.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Driver: <strong>{r.driver}</strong> • Vehicle: <strong>{r.vehicle}</strong> • {r.totalStudents} Students
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success">Pickup: {r.pickupTime}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Drop: {r.dropTime}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Designated Bus Stops
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {r.stops?.map((stop, i) => (
                    <span key={i} className="badge badge-primary" style={{ padding: '6px 12px' }}>
                      <MapPin size={12} /> {i + 1}. {stop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
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
                  <tr key={v.id}>
                    <td><strong>{v.vehicleNumber}</strong></td>
                    <td><span className="badge badge-primary">{v.type}</span></td>
                    <td><strong>{v.capacity} Seats</strong></td>
                    <td>{v.driver}</td>
                    <td>{v.insuranceExpiry}</td>
                    <td><StatusBadge status={v.status} /></td>
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
            onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
            placeholder="e.g. Thomas Wayne"
          />
          <div className="grid-2">
            <FormInput
              label="Contact Phone"
              value={newDriver.phone}
              onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
              placeholder="+1 (555) 901-0000"
            />
            <FormInput
              label="Driver License #"
              value={newDriver.licenseNumber}
              onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
              placeholder="DL-NY-9918231"
            />
          </div>

          <div className="grid-2">
            <Select
              label="Assigned Route"
              value={newDriver.route}
              onChange={(e) => setNewDriver({ ...newDriver, route: e.target.value })}
              options={['Route 1 - North Express', 'Route 2 - West Ridge', 'Route 3 - South Valley']}
            />
            <FormInput
              label="Assigned Vehicle Plate"
              value={newDriver.vehicleNumber}
              onChange={(e) => setNewDriver({ ...newDriver, vehicleNumber: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddDriverModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Driver
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
