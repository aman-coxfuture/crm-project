import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import { FormInput, Select } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Award, Plus, Calendar, Eye, FileText, CheckCircle2, Printer, Percent } from 'lucide-react';

export default function ExaminationsPage() {
  const { success, info } = useToast();
  const [exams, setExams] = useState(() => schoolDataService.getExams());
  const [activeTab, setActiveTab] = useState('list');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState(null);

  // New Exam Form
  const [newExam, setNewExam] = useState({
    name: 'Term 2 Final Assessments',
    term: 'Term 2',
    academicYear: '2025-2026',
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    classesIncluded: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
  });

  const marksData = schoolDataService.getMarks();
  const sampleMarksList = Object.values(marksData);

  const handleCreateExam = (e) => {
    e.preventDefault();
    const created = schoolDataService.addExam(newExam);
    setExams(schoolDataService.getExams());
    setIsCreateModalOpen(false);
    success(`Examination "${created.name}" created!`);
  };

  const examColumns = [
    {
      header: 'Exam Name',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {row.term} • Academic Year {row.academicYear}
          </div>
        </div>
      ),
    },
    {
      header: 'Exam Period',
      accessor: 'startDate',
      sortable: true,
      render: (val, row) => (
        <div style={{ fontSize: '0.825rem' }}>
          {val} to {row.endDate}
        </div>
      ),
    },
    {
      header: 'Grades Participating',
      accessor: 'classesIncluded',
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
            <Award size={26} color="var(--primary)" />
            Examinations, Marks & Report Cards
          </h1>
          <p className="page-subtitle">
            Schedule examinations, enter subject marks, generate academic ranks and report cards
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} />
          <span>Create New Examination</span>
        </button>
      </div>

      <Tabs
        tabs={[
          { id: 'list', label: 'Examination Series', icon: <Calendar size={15} /> },
          { id: 'results', label: 'Student Results & Report Cards', icon: <FileText size={15} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {activeTab === 'list' && (
        <div>
          <DataTable
            title="Scheduled Examinations"
            subtitle="Central examination timetable and status"
            columns={examColumns}
            data={exams}
            searchKeys={['name', 'term', 'academicYear', 'status']}
          />

          {/* Exam Schedule Preview Card */}
          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Mid-Term Examination Schedule Matrix (Class 10-A)</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Official hall allocation and timing</p>
              </div>
              <span className="badge badge-success">Approved Timetable</span>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Time Slot</th>
                    <th>Max Marks</th>
                    <th>Pass Marks</th>
                    <th>Exam Hall</th>
                  </tr>
                </thead>
                <tbody>
                  {exams[0]?.schedule?.map((item, i) => (
                    <tr key={i}>
                      <td><strong>{item.date}</strong></td>
                      <td><span className="badge badge-primary">{item.subject}</span></td>
                      <td>{item.startTime} – {item.endTime}</td>
                      <td>{item.maxMarks}</td>
                      <td>{item.passMarks}</td>
                      <td><strong>{item.room}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Student Results & Printable Report Cards */}
      {activeTab === 'results' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Total Scored</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sampleMarksList.map((m, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{m.examName}</div>
                    </td>
                    <td><strong>{m.roll}</strong></td>
                    <td><span className="badge badge-primary">{m.class}</span></td>
                    <td><strong>{m.totalObtained}</strong> / {m.totalMax}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{m.percentage}%</span>
                    </td>
                    <td>
                      <span className="badge badge-success">{m.grade}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">{m.result}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedReportCard(m)}
                      >
                        <Eye size={13} />
                        <span>View Report Card</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINTABLE REPORT CARD MODAL */}
      <Modal
        isOpen={!!selectedReportCard}
        onClose={() => setSelectedReportCard(null)}
        title="Official Academic Term Report Card"
        subtitle={`Student: ${selectedReportCard?.studentName} • ${selectedReportCard?.roll}`}
        size="lg"
      >
        {selectedReportCard && (
          <div id="printable-report-card">
            {/* School Header */}
            <div
              style={{
                textAlign: 'center',
                paddingBottom: '16px',
                borderBottom: '2px solid var(--border-color)',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                Greenwood International Public School
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Affiliated with CBSE Board • Academic Session 2025-2026
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)' }}>
                {selectedReportCard.examName}
              </div>
            </div>

            {/* Student Info Details */}
            <div className="grid-3" style={{ gap: '12px', marginBottom: '20px' }}>
              <div className="card" style={{ padding: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>STUDENT NAME</div>
                <div style={{ fontWeight: 700 }}>{selectedReportCard.studentName}</div>
              </div>
              <div className="card" style={{ padding: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>ROLL NUMBER & CLASS</div>
                <div style={{ fontWeight: 700 }}>{selectedReportCard.roll} • Class {selectedReportCard.class}</div>
              </div>
              <div className="card" style={{ padding: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>CLASS RANK</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Rank #{selectedReportCard.rank} in Section</div>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="table-container" style={{ marginBottom: '20px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Max Marks</th>
                    <th>Marks Obtained</th>
                    <th>Grade</th>
                    <th>Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReportCard.subjects.map((sub, i) => (
                    <tr key={i}>
                      <td><strong>{sub.name}</strong></td>
                      <td>{sub.maxMarks}</td>
                      <td><strong>{sub.obtained}</strong></td>
                      <td><span className="badge badge-success">{sub.grade}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.remarks}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', fontWeight: 800 }}>
                    <td>Grand Total</td>
                    <td>{selectedReportCard.totalMax}</td>
                    <td style={{ color: 'var(--primary)' }}>{selectedReportCard.totalObtained}</td>
                    <td><span className="badge badge-success">{selectedReportCard.grade}</span></td>
                    <td>Percentage: {selectedReportCard.percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedReportCard(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={15} />
                <span>Print Official Report Card</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE EXAM MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Examination"
        subtitle="Set term details and participating classes"
      >
        <form onSubmit={handleCreateExam}>
          <FormInput
            label="Examination Title"
            required
            value={newExam.name}
            onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
            placeholder="e.g. Annual Final Board Examinations"
          />
          <div className="grid-2">
            <Select
              label="Academic Term"
              value={newExam.term}
              onChange={(e) => setNewExam({ ...newExam, term: e.target.value })}
              options={['Term 1', 'Term 2', 'Unit Test 1', 'Unit Test 2', 'Pre-Board']}
            />
            <FormInput
              label="Academic Year"
              value={newExam.academicYear}
              onChange={(e) => setNewExam({ ...newExam, academicYear: e.target.value })}
            />
          </div>
          <div className="grid-2">
            <FormInput
              label="Start Date"
              type="date"
              value={newExam.startDate}
              onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
            />
            <FormInput
              label="End Date"
              type="date"
              value={newExam.endDate}
              onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule Exam
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
