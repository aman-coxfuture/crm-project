import React, { useState } from 'react';
import { schoolDataService, SCHOOL_CLASSES } from '../../services/schoolDataService';
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
  Award,
  Layers,
  CheckCircle2,
  CalendarCheck,
  Clock,
  UserCheck,
} from 'lucide-react';

export default function TeachersPage() {
  const { success, info } = useToast();
  const [teachers, setTeachers] = useState(() => schoolDataService.getTeachers('SCH-001'));
  const [assignments, setAssignments] = useState(() => schoolDataService.getTeacherAssignments('SCH-001'));
  const [mainTab, setMainTab] = useState('faculty');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // New Faculty Member Form State
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Mathematics',
    department: 'Mathematics & Computing',
    classes: ['Class 5'],
    experience: '5 Years',
    qualification: 'M.Sc, B.Ed',
    salary: '$55,000/yr',
  });

  // New Class Assignment Form State (Principal -> Teacher -> Class & Subject)
  const [assignmentForm, setAssignmentForm] = useState({
    teacherId: teachers[0]?.id || 'TCH-001',
    className: 'Class 5',
    section: 'A',
    subject: 'Mathematics',
    room: 'Room 201',
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email) return;

    const created = schoolDataService.addTeacher(newTeacher);
    setTeachers(schoolDataService.getTeachers('SCH-001'));
    setIsAddModalOpen(false);
    setNewTeacher({
      name: '',
      email: '',
      phone: '',
      subject: 'Mathematics',
      department: 'Mathematics & Computing',
      classes: ['Class 5'],
      experience: '5 Years',
      qualification: 'M.Sc, B.Ed',
      salary: '$55,000/yr',
    });
    success(`Teacher ${created.name} added to faculty roster!`);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    const teacherObj = teachers.find((t) => t.id === assignmentForm.teacherId) || teachers[0];

    schoolDataService.assignTeacherToClass({
      teacherId: teacherObj.id,
      teacherName: teacherObj.name,
      className: assignmentForm.className,
      section: assignmentForm.section,
      subject: assignmentForm.subject,
      room: assignmentForm.room,
      schoolId: 'SCH-001',
    });

    setAssignments(schoolDataService.getTeacherAssignments('SCH-001'));
    setTeachers(schoolDataService.getTeachers('SCH-001'));
    setIsAssignModalOpen(false);
    success(`Assigned ${teacherObj.name} to ${assignmentForm.className} (${assignmentForm.section}) for ${assignmentForm.subject}!`);
  };

  const handleDeleteConfirm = () => {
    if (!teacherToDelete) return;
    const updated = schoolDataService.deleteTeacher(teacherToDelete.id);
    setTeachers(schoolDataService.getTeachers('SCH-001'));
    setTeacherToDelete(null);
    if (selectedTeacher?.id === teacherToDelete.id) setSelectedTeacher(null);
    success('Teacher removed from roster');
  };

  const handleDeleteAssignment = (id) => {
    const list = assignments.filter((a) => a.id !== id);
    schoolDataService.saveTeacherAssignments(list);
    setAssignments(list);
    info('Class allocation removed');
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
      header: 'Primary Subject & Dept',
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
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setAssignmentForm((prev) => ({ ...prev, teacherId: row.id }));
              setIsAssignModalOpen(true);
            }}
            title="Assign Classes to Teacher"
          >
            <Layers size={13} />
            <span>Assign</span>
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

  const assignmentColumns = [
    {
      header: 'Teacher Name',
      accessor: 'teacherName',
      sortable: true,
      render: (val, row) => (
        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {val} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>({row.teacherId})</span>
        </div>
      ),
    },
    {
      header: 'Assigned Class & Section',
      accessor: 'class',
      sortable: true,
      render: (val, row) => (
        <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
          {val} - Section {row.section}
        </span>
      ),
    },
    {
      header: 'Subject Curriculum',
      accessor: 'subject',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Assigned Room',
      accessor: 'room',
      sortable: true,
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (id) => (
        <button
          className="btn btn-icon btn-sm"
          onClick={() => handleDeleteAssignment(id)}
          title="Remove Allocation"
        >
          <Trash2 size={14} color="var(--danger)" />
        </button>
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
            Assign educators to Nursery–Class 10, manage subject curriculums and schedules
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(true)}>
            <Layers size={16} />
            <span>Assign Teacher to Class</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            <span>Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div style={{ marginBottom: '18px' }}>
        <Tabs
          tabs={[
            { id: 'faculty', label: `Faculty Directory (${teachers.length})`, icon: <User size={15} /> },
            { id: 'assignments', label: `Class & Subject Allocations (${assignments.length})`, icon: <Layers size={15} /> },
          ]}
          activeTab={mainTab}
          onChange={setMainTab}
          variant="pills"
        />
      </div>

      {mainTab === 'faculty' ? (
        <DataTable
          title="Teaching Faculty Roster"
          subtitle={`Total ${teachers.length} certified educators in school`}
          columns={columns}
          data={teachers}
          searchKeys={['name', 'id', 'email', 'subject', 'department']}
          filterOptions={[
            { label: 'Department', key: 'department', options: ['Mathematics & Computing', 'Languages & Arts', 'Science', 'Social Sciences', 'Sports & Wellness'] },
            { label: 'Status', key: 'status', options: ['Active', 'On Leave'] },
          ]}
        />
      ) : (
        <DataTable
          title="Active Teacher-to-Class Allocations"
          subtitle="Principal assignments mapping teachers to grades (Nursery to Class 10)"
          columns={assignmentColumns}
          data={assignments}
          searchKeys={['teacherName', 'class', 'subject', 'room']}
          filterOptions={[
            { label: 'Class', key: 'class', options: SCHOOL_CLASSES },
          ]}
        />
      )}

      {/* PRINCIPAL -> TEACHER -> CLASS ASSIGNMENT MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Teacher to Class & Subject"
        subtitle="Principal allocation: Select faculty, target grade (Nursery–Class 10) and subject"
        size="md"
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label">Select Teacher</label>
            <select
              className="form-select"
              value={assignmentForm.teacherId}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, teacherId: e.target.value })}
              required
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.subject} ({t.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Select Class (Nursery to 10)</label>
              <select
                className="form-select"
                value={assignmentForm.className}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, className: e.target.value })}
                required
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Section</label>
              <select
                className="form-select"
                value={assignmentForm.section}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, section: e.target.value })}
                required
              >
                {['A', 'B', 'C', 'D'].map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={assignmentForm.subject}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                required
              >
                {['Mathematics', 'English', 'Science', 'Hindi', 'Social Science', 'Computer', 'PT', 'Physics', 'Chemistry', 'Biology', 'Art & Craft', 'General Awareness'].map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Assigned Classroom / Lab"
              value={assignmentForm.room}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, room: e.target.value })}
              placeholder="e.g. Room 201 or Lab 1"
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign Teacher
            </button>
          </div>
        </form>
      </Modal>

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
                <div style={{ fontWeight: 700, marginBottom: '10px' }}>Assigned Classes & Subjects</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {selectedTeacher.classes?.map((c, i) => (
                    <span key={i} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                      {c}
                    </span>
                  ))}
                </div>
                <div style={{ fontWeight: 700, marginBottom: '8px' }}>Assigned Subjects</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(selectedTeacher.assignedSubjects || [selectedTeacher.subject]).map((sub, i) => (
                    <span key={i} className="badge badge-purple">
                      {sub}
                    </span>
                  ))}
                </div>
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
              placeholder="e.g. Rahul Sharma"
            />
            <FormInput
              label="Official Email"
              type="email"
              required
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              placeholder="rahul@example.com"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Contact Phone"
              value={newTeacher.phone}
              onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
              placeholder="+1 (555) 789-0123"
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
              options={['Mathematics & Computing', 'Languages & Arts', 'Science', 'Social Sciences', 'Sports & Wellness']}
            />
            <FormInput
              label="Experience"
              value={newTeacher.experience}
              onChange={(e) => setNewTeacher({ ...newTeacher, experience: e.target.value })}
              placeholder="e.g. 7 Years"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Academic Qualification"
              value={newTeacher.qualification}
              onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
              placeholder="e.g. M.Sc Mathematics, B.Ed"
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
