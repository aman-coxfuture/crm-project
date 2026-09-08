import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolDataService } from '../../services/schoolDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import {
  Building2,
  Plus,
  ExternalLink,
  Power,
  Eye,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
} from 'lucide-react';

export default function SchoolsManagementPage() {
  const navigate = useNavigate();
  const { changeSchool, switchRole } = useAuth();
  const { success, info } = useToast();

  const [schools, setSchools] = useState(() => schoolDataService.getSchools());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSchoolDetail, setSelectedSchoolDetail] = useState(null);

  const [newSchool, setNewSchool] = useState({
    name: '',
    schoolCode: '',
    principal: '',
    email: '',
    phone: '',
    address: '',
    affiliation: 'CBSE / State Board',
    establishedYear: '2020',
  });

  const handleToggleStatus = (id) => {
    const updated = schoolDataService.toggleSchoolStatus(id);
    setSchools(updated);
    info('School status toggled');
  };

  const handleOpenSchool = async (school) => {
    changeSchool(school);
    await switchRole('school-admin');
    success(`Switched active context to ${school.name}`);
    navigate('/school-admin/dashboard');
  };

  const handleAddSchoolSubmit = (e) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.principal) return;
    const created = schoolDataService.addSchool(newSchool);
    setSchools(schoolDataService.getSchools());
    setIsAddModalOpen(false);
    setNewSchool({
      name: '',
      schoolCode: '',
      principal: '',
      email: '',
      phone: '',
      address: '',
      affiliation: 'CBSE / State Board',
      establishedYear: '2020',
    });
    success(`School "${created.name}" onboarded successfully!`);
  };

  const columns = [
    {
      header: 'School Information',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            {row.logo || '🏫'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Code: {row.schoolCode} • Est. {row.establishedYear}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Principal / Head',
      accessor: 'principal',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Affiliation & Board',
      accessor: 'affiliation',
      sortable: true,
      render: (val) => <span className="badge badge-info">{val}</span>,
    },
    {
      header: 'Total Students',
      accessor: 'studentsCount',
      sortable: true,
      render: (val) => <strong>{val?.toLocaleString()}</strong>,
    },
    {
      header: 'Faculty & Staff',
      accessor: 'teachersCount',
      sortable: true,
      render: (val, row) => (
        <div style={{ fontSize: '0.8rem' }}>
          <span>{val} Teachers</span> • <span style={{ color: 'var(--text-tertiary)' }}>{row.staffCount} Staff</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      isStatus: true,
      sortable: true,
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (id, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedSchoolDetail(row)}
            title="View School Details"
          >
            <Eye size={13} />
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenSchool(row)}
            title="Launch School Admin"
          >
            <ExternalLink size={13} />
            <span>Launch</span>
          </button>
          <button
            className={`btn btn-sm ${row.status === 'Active' ? 'btn-outline' : 'btn-success'}`}
            onClick={() => handleToggleStatus(id)}
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            <Power size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Building2 size={26} color="var(--primary)" />
            All Schools Directory
          </h1>
          <p className="page-subtitle">
            Manage, onboard and configure all regional school institutions
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Add New School</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={schools}
        searchKeys={['name', 'schoolCode', 'principal', 'email', 'address']}
        filterOptions={[
          { label: 'Status', key: 'status', options: ['Active', 'Inactive'] },
          { label: 'Board', key: 'affiliation', options: ['CBSE / State Board', 'ICSE / Cambridge', 'IB World School'] },
        ]}
      />

      {/* View School Detail Modal */}
      <Modal
        isOpen={!!selectedSchoolDetail}
        onClose={() => setSelectedSchoolDetail(null)}
        title={selectedSchoolDetail?.name || 'School Details'}
        subtitle={`Institution ID: ${selectedSchoolDetail?.schoolCode}`}
        size="lg"
      >
        {selectedSchoolDetail && (
          <div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '3rem' }}>{selectedSchoolDetail.logo || '🏫'}</span>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedSchoolDetail.name}</h3>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span className="badge badge-primary">{selectedSchoolDetail.affiliation}</span>
                  <span className={`badge ${selectedSchoolDetail.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                    {selectedSchoolDetail.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '14px', marginBottom: '18px' }}>
              <div className="card" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>PRINCIPAL</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedSchoolDetail.principal}</div>
              </div>
              <div className="card" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>CONTACT EMAIL</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedSchoolDetail.email}</div>
              </div>
              <div className="card" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>PHONE</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedSchoolDetail.phone}</div>
              </div>
              <div className="card" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>ENROLLMENT</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>
                  {selectedSchoolDetail.studentsCount} Students • {selectedSchoolDetail.teachersCount} Teachers
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>CAMPUS ADDRESS</div>
              <div style={{ fontSize: '0.875rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                {selectedSchoolDetail.address}
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleOpenSchool(selectedSchoolDetail);
                  setSelectedSchoolDetail(null);
                }}
              >
                <ExternalLink size={14} />
                <span>Launch This School's Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add School Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New School"
        subtitle="Provide institutional details for onboarding"
        size="lg"
      >
        <form onSubmit={handleAddSchoolSubmit}>
          <div className="grid-2">
            <FormInput
              label="School Name"
              required
              value={newSchool.name}
              onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
              placeholder="e.g. Oakridge Academy"
            />
            <FormInput
              label="School Code / Number"
              value={newSchool.schoolCode}
              onChange={(e) => setNewSchool({ ...newSchool, schoolCode: e.target.value })}
              placeholder="e.g. OAK-108"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Principal Name"
              required
              value={newSchool.principal}
              onChange={(e) => setNewSchool({ ...newSchool, principal: e.target.value })}
              placeholder="e.g. Dr. Arthur Miller"
            />
            <FormInput
              label="Official Email"
              type="email"
              value={newSchool.email}
              onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
              placeholder="office@oakridge.edu"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Phone Number"
              value={newSchool.phone}
              onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
            <Select
              label="Board / Affiliation"
              value={newSchool.affiliation}
              onChange={(e) => setNewSchool({ ...newSchool, affiliation: e.target.value })}
              options={['CBSE / State Board', 'ICSE / Cambridge', 'IB World School']}
            />
          </div>

          <Textarea
            label="Postal Address"
            value={newSchool.address}
            onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
            placeholder="Street address, city, state, zip"
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Campus
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
