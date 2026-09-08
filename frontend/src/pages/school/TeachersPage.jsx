import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FormInput, Select } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  GraduationCap,
  Plus,
  Eye,
  Trash2,
  BookOpen,
  User,
  Calendar,
  Award,
  Mail,
  Phone,
  Clock,
  Briefcase,
} from 'lucide-react';

export default function TeachersPage() {
  const { success, info } = useToast();
  const [teachers, setTeachers] = useState(() => schoolDataService.getTeachers());

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Mathematics',
    department: 'Science & Math',
    classes: ['10-A'],
    experience: '5 Years',
    qualification: 'M.Sc, B.Ed',
    salary: '$55,000/yr',
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email) return;

    const created = schoolDataService.addTeacher(newTeacher);
    setTeachers(schoolDataService.getTeachers());
    setIsAddModalOpen(false);
    setNewTeacher({
      name: '',
      email: '',
      phone: '',
      subject: 'Mathematics',
      department: 'Science & Math',
      classes: ['10-A'],
      experience: '5 Years',
      qualification: 'M.Sc, B.Ed',
      salary: '$55,000/yr',
    });
    success(`Teacher ${created.name} added to faculty roster!`);
  };

  const handleDeleteConfirm = () => {
    if (!teacherToDelete) return;
    const updated = schoolDataService.deleteTeacher(teacherToDelete.id);
    setTeachers(updated);
    setTeacherToDelete(null);
    if (selectedTeacher?.id === teacherToDelete.id) setSelectedTeacher(null);
    success('Teacher removed from roster');
  };

  const columns = [
    {
      header: 'Teacher Name & ID',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={val}
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {row.id} • {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Subject & Dept',
      accessor: 'subject',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.department}</div>
        </div>
      ),
    },
    {
      header: 'Assigned Classes',
      accessor: 'classes',
      render: (classes) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {classes?.map((c, i) => (
            <span key={i} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              {c}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Experience',
      accessor: 'experience',
      sortable: true,
    },
    {
      header: 'Joining Date',
      accessor: 'joiningDate',
      sortable: true,
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
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSelectedTeacher(row);
              setActiveTab('profile');
            }}
            title="View Teacher Profile"
          >
            <Eye size={13} />
            <span>Profile</span>
          </button>
          <button
            className="btn btn-icon btn-sm"
            onClick={() => setTeacherToDelete(row)}
            title="Remove Teacher"
          >
            <Trash2 size={13} color="var(--danger)" />
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
            <GraduationCap size={26} color="var(--primary)" />
            Faculty & Teacher Management
          </h1>
          <p className="page-subtitle">
            Manage teaching faculty, subject assignments, schedules and qualifications
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Add New Teacher</span>
        </button>
      </div>

      <DataTable
        title="School Faculty Roster"
        subtitle={`Total ${teachers.length} certified educators`}
        columns={columns}
        data={teachers}
        searchKeys={['name', 'id', 'email', 'subject', 'department']}
        filterOptions={[
          { label: 'Department', key: 'department', options: ['Science & Math', 'Languages & Arts', 'Social Sciences', 'Technology'] },
          { label: 'Status', key: 'status', options: ['Active', 'On Leave'] },
        ]}
      />

      {/* TEACHER PROFILE MODAL */}
      <Modal
        isOpen={!!selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        title={selectedTeacher ? `${selectedTeacher.name} - Profile` : 'Teacher Profile'}
        subtitle={`Department of ${selectedTeacher?.department} • ${selectedTeacher?.id}`}
        size="lg"
      >
        {selectedTeacher && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <img
                src={selectedTeacher.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={selectedTeacher.name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedTeacher.name}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span className="badge badge-primary">{selectedTeacher.subject} Specialist</span>
                  <StatusBadge status={selectedTeacher.status} size="sm" />
                </div>
              </div>
            </div>

            <Tabs
              tabs={[
                { id: 'profile', label: 'Faculty Information', icon: <User size={14} /> },
                { id: 'schedule', label: 'Class Allocations', icon: <Clock size={14} /> },
                { id: 'qualification', label: 'Qualifications & Salary', icon: <Award size={14} /> },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === 'profile' && (
              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="card" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>EMAIL</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedTeacher.email}</div>
                </div>
                <div className="card" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>PHONE</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedTeacher.phone}</div>
                </div>
                <div className="card" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>DEPARTMENT</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedTeacher.department}</div>
                </div>
                <div className="card" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>TEACHING EXPERIENCE</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedTeacher.experience}</div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: '10px' }}>Assigned Sections & Students</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {selectedTeacher.classes?.map((c, i) => (
                    <span key={i} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                      Class {c}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Total active student reach: <strong>{selectedTeacher.totalStudents || 110} students</strong>
                </p>
              </div>
            )}

            {activeTab === 'qualification' && (
              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="card" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ACADEMIC QUALIFICATIONS</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedTeacher.qualification}</div>
                </div>
                <div className="card" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ANNUAL COMPENSATION</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedTeacher.salary}</div>
                </div>
                <div className="card" style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>JOINING DATE</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{selectedTeacher.joiningDate}</div>
                </div>
              </div>
            )}

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedTeacher(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD TEACHER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Faculty Member"
        subtitle="Register teacher qualifications and subject department"
        size="lg"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="grid-2">
            <FormInput
              label="Teacher Full Name"
              required
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
              placeholder="e.g. Dr. Arthur Miller"
            />
            <FormInput
              label="Official Email"
              type="email"
              required
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              placeholder="arthur.m@school.edu"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Contact Phone"
              value={newTeacher.phone}
              onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
              placeholder="+1 (555) 345-0011"
            />
            <FormInput
              label="Primary Subject"
              value={newTeacher.subject}
              onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
              placeholder="e.g. Mathematics"
            />
          </div>

          <div className="grid-2">
            <Select
              label="Department"
              value={newTeacher.department}
              onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
              options={['Science & Math', 'Languages & Arts', 'Social Sciences', 'Technology', 'Sports & Physical Ed']}
            />
            <FormInput
              label="Experience"
              value={newTeacher.experience}
              onChange={(e) => setNewTeacher({ ...newTeacher, experience: e.target.value })}
              placeholder="e.g. 6 Years"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Academic Qualification"
              value={newTeacher.qualification}
              onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
              placeholder="e.g. M.Sc Physics, B.Ed"
            />
            <FormInput
              label="Annual Salary"
              value={newTeacher.salary}
              onChange={(e) => setNewTeacher({ ...newTeacher, salary: e.target.value })}
              placeholder="$58,000/yr"
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Teacher
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!teacherToDelete}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Teacher Record"
        message={`Are you sure you want to remove ${teacherToDelete?.name} from the school faculty roster?`}
        isDangerous={true}
      />
    </div>
  );
}
