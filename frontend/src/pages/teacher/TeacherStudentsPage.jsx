import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import DataTable from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, Eye, Mail, Phone, BookOpen } from 'lucide-react';

export default function TeacherStudentsPage() {
  const allStudents = schoolDataService.getStudents();
  const [selectedClass, setSelectedClass] = useState('10');

  const filteredStudents = allStudents.filter((s) => s.class === selectedClass);

  const columns = [
    {
      header: 'Student Name & Roll',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={row.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={val}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 700 }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Roll: {row.rollNumber} • {row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Section',
      accessor: 'section',
      sortable: true,
      render: (val) => <span className="badge badge-primary">Section {val}</span>,
    },
    {
      header: 'Parent Contact',
      accessor: 'parentName',
      render: (val, row) => (
        <div style={{ fontSize: '0.8rem' }}>
          <div>{val}</div>
          <div style={{ color: 'var(--text-tertiary)' }}>{row.parentPhone}</div>
        </div>
      ),
    },
    {
      header: 'Attendance Rate',
      accessor: 'attendance',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 700, color: val >= 90 ? 'var(--success-text)' : 'var(--warning-text)' }}>
          {val}%
        </span>
      ),
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
            <Users size={26} color="var(--primary)" />
            My Assigned Students
          </h1>
          <p className="page-subtitle">
            Students enrolled in your Mathematics and Science teaching sections
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Select Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-select"
            style={{ width: '130px', height: '38px', fontSize: '0.85rem' }}
          >
            {['8', '9', '10', '11', '12'].map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        title={`Class ${selectedClass} Students Roster`}
        subtitle="Active students in your subject curriculum"
        columns={columns}
        data={filteredStudents}
        searchKeys={['name', 'rollNumber', 'email', 'parentName']}
      />
    </div>
  );
}
