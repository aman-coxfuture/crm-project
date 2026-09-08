import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { FormInput, Select } from '../../components/common/FormInput';
import { Layers, Plus, Users, BookOpen, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function ClassesPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [classes, setClasses] = useState(() => schoolDataService.getClasses());
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [targetClass, setTargetClass] = useState(null);

  const [newSection, setNewSection] = useState({
    name: 'Section D',
    classTeacher: 'Elena Rostova',
    studentCount: 30,
    room: 'Room 208',
  });

  const handleAddSectionSubmit = (e) => {
    e.preventDefault();
    if (!targetClass) return;

    const updated = classes.map((c) => {
      if (c.id === targetClass.id) {
        return {
          ...c,
          sections: [...c.sections, { ...newSection, studentCount: Number(newSection.studentCount) }],
          totalStudents: c.totalStudents + Number(newSection.studentCount),
        };
      }
      return c;
    });

    setClasses(updated);
    schoolDataService.saveClasses(updated);
    setIsAddSectionModalOpen(false);
    success(`New section added to ${targetClass.name}!`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers size={26} color="var(--primary)" />
            Class & Section Management
          </h1>
          <p className="page-subtitle">
            Configure grades, divisions, assigned class educators and subject curriculum
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {classes.map((cls) => (
          <div key={cls.id} className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                  }}
                >
                  {cls.numericGrade}
                </div>
                <div>
                  <h3 className="card-title">{cls.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Total {cls.totalStudents} Enrolled • {cls.sections.length} Sections
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/school-admin/timetable')}
                >
                  <Clock size={14} />
                  <span>Timetable</span>
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setTargetClass(cls);
                    setIsAddSectionModalOpen(true);
                  }}
                >
                  <Plus size={14} />
                  <span>Add Section</span>
                </button>
              </div>
            </div>

            {/* Sections Grid */}
            <div className="grid-3" style={{ marginBottom: '16px' }}>
              {cls.sections.map((sec, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {sec.name}
                    </h4>
                    <span className="badge badge-primary">
                      <Users size={12} /> {sec.studentCount} Students
                    </span>
                  </div>

                  <div style={{ fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Class Teacher: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{sec.classTeacher}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Assigned Room: </span>
                      <strong style={{ color: 'var(--text-secondary)' }}>{sec.room}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subject Badges */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Curriculum Subjects
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {cls.subjects.map((sub, i) => (
                  <span key={i} className="badge badge-gray">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Section Modal */}
      <Modal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        title={`Add Section to ${targetClass?.name}`}
        subtitle="Create an additional division with assigned educator"
      >
        <form onSubmit={handleAddSectionSubmit}>
          <FormInput
            label="Section Division Name"
            required
            value={newSection.name}
            onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
            placeholder="e.g. Section D or Arts"
          />
          <FormInput
            label="Class Teacher Name"
            required
            value={newSection.classTeacher}
            onChange={(e) => setNewSection({ ...newSection, classTeacher: e.target.value })}
            placeholder="e.g. Elena Rostova"
          />
          <div className="grid-2">
            <FormInput
              label="Student Capacity"
              type="number"
              value={newSection.studentCount}
              onChange={(e) => setNewSection({ ...newSection, studentCount: e.target.value })}
            />
            <FormInput
              label="Room Number / Wing"
              value={newSection.room}
              onChange={(e) => setNewSection({ ...newSection, room: e.target.value })}
              placeholder="Room 205"
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddSectionModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Section
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
