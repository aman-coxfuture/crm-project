import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { FormInput, Select } from '../../components/common/FormInput';
import {
  staffSalaryService,
  calculateStaffSalary,
  formatSalaryCurrency,
  SALARY_MONTHS,
} from '../../data/mockStaffSalaryData';
import {
  Briefcase,
  Plus,
  Search,
  Users,
  GraduationCap,
  Bus,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  DollarSign,
  UserCheck,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  FileText,
  CreditCard,
  Edit3,
} from 'lucide-react';

export default function StaffPage() {
  const { success, info } = useToast();

  // Selected Month State
  const [selectedMonth, setSelectedMonth] = useState('September 2026');

  // Staff Salary Records loaded from staffSalaryService
  const [staffList, setStaffList] = useState(() => staffSalaryService.getRecordsForMonth('September 2026'));

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All' | 'Teacher' | 'Driver' | 'Staff'
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'Paid' | 'Pending'

  // Modals State
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit Leave Form State inside Modal
  const [editWorkingDays, setEditWorkingDays] = useState(30);
  const [editPaidLeave, setEditPaidLeave] = useState(0);
  const [editUnpaidLeave, setEditUnpaidLeave] = useState(0);

  // Add Staff Member Form State
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Staff',
    department: 'Administration',
    designation: 'Office Executive',
    monthlySalary: 30000,
  });

  // Handle Month Change
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    const records = staffSalaryService.getRecordsForMonth(newMonth);
    setStaffList(records);
    if (selectedStaffForSalary) {
      const updatedSelected = records.find((s) => s.id === selectedStaffForSalary.id);
      if (updatedSelected) {
        openSalaryModal(updatedSelected);
      }
    }
  };

  const handlePrevMonth = () => {
    const currentIndex = SALARY_MONTHS.indexOf(selectedMonth);
    if (currentIndex < SALARY_MONTHS.length - 1) {
      handleMonthChange(SALARY_MONTHS[currentIndex + 1]);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = SALARY_MONTHS.indexOf(selectedMonth);
    if (currentIndex > 0) {
      handleMonthChange(SALARY_MONTHS[currentIndex - 1]);
    }
  };

  // Open Salary Details Modal
  const openSalaryModal = (staff) => {
    setSelectedStaffForSalary(staff);
    setEditWorkingDays(staff.totalWorkingDays || 30);
    setEditPaidLeave(staff.paidLeave || 0);
    setEditUnpaidLeave(staff.unpaidLeave || 0);
  };

  // Dynamic Live Calculation for Modal Preview
  const liveSalaryPreview = useMemo(() => {
    if (!selectedStaffForSalary) return null;
    return calculateStaffSalary({
      ...selectedStaffForSalary,
      totalWorkingDays: Number(editWorkingDays) || 30,
      paidLeave: Number(editPaidLeave) || 0,
      unpaidLeave: Number(editUnpaidLeave) || 0,
    });
  }, [selectedStaffForSalary, editWorkingDays, editPaidLeave, editUnpaidLeave]);

  // Save Leave Updates
  const handleSaveLeaveUpdates = (e) => {
    e?.preventDefault();
    if (!selectedStaffForSalary) return;

    const updatedRecords = staffSalaryService.updateStaffRecord(selectedMonth, selectedStaffForSalary.id, {
      totalWorkingDays: Number(editWorkingDays) || 30,
      paidLeave: Number(editPaidLeave) || 0,
      unpaidLeave: Number(editUnpaidLeave) || 0,
    });

    setStaffList(updatedRecords);
    const updatedStaff = updatedRecords.find((s) => s.id === selectedStaffForSalary.id);
    setSelectedStaffForSalary(updatedStaff);
    success(`Leave records updated for ${selectedStaffForSalary.name}!`);
  };

  // Toggle Salary Status (Mark as Paid / Mark as Pending)
  const handleToggleSalaryStatus = (newStatus) => {
    if (!selectedStaffForSalary) return;

    const updatedRecords = staffSalaryService.updateStaffRecord(selectedMonth, selectedStaffForSalary.id, {
      salaryStatus: newStatus,
      totalWorkingDays: Number(editWorkingDays) || 30,
      paidLeave: Number(editPaidLeave) || 0,
      unpaidLeave: Number(editUnpaidLeave) || 0,
    });

    setStaffList(updatedRecords);
    const updatedStaff = updatedRecords.find((s) => s.id === selectedStaffForSalary.id);
    setSelectedStaffForSalary(updatedStaff);
    success(`Salary status for ${selectedStaffForSalary.name} marked as ${newStatus}!`);
  };

  // Handle Add Staff Submit
  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaff.name) return;

    const created = staffSalaryService.addStaffMember(newStaff);
    if (created) {
      const records = staffSalaryService.getRecordsForMonth(selectedMonth);
      setStaffList(records);
      setIsAddModalOpen(false);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        type: 'Staff',
        department: 'Administration',
        designation: 'Office Executive',
        monthlySalary: 30000,
      });
      success(`Staff member ${created.name} registered successfully!`);
    }
  };

  // Filtered Staff List
  const filteredStaff = useMemo(() => {
    return staffList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.designation.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Teachers' && item.type === 'Teacher') ||
        (selectedCategory === 'Drivers' && item.type === 'Driver') ||
        (selectedCategory === 'Other Staff' && item.type === 'Staff');

      const matchStatus = selectedStatus === 'All' || item.salaryStatus === selectedStatus;

      return matchQuery && matchCategory && matchStatus;
    });
  }, [staffList, searchQuery, selectedCategory, selectedStatus]);

  // Overall Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalStaffCount = staffList.length;
    const totalMonthlySalary = staffList.reduce((acc, s) => acc + (Number(s.monthlySalary) || 0), 0);
    const totalLeaveDeduction = staffList.reduce((acc, s) => acc + (Number(s.leaveDeduction) || 0), 0);
    const totalPayableSalary = staffList.reduce((acc, s) => acc + (Number(s.netSalary) || 0), 0);

    const paidCount = staffList.filter((s) => s.salaryStatus === 'Paid').length;
    const pendingCount = staffList.filter((s) => s.salaryStatus === 'Pending').length;

    return {
      totalStaffCount,
      totalMonthlySalary,
      totalLeaveDeduction,
      totalPayableSalary,
      paidCount,
      pendingCount,
    };
  }, [staffList]);

  // Helper badge renderers
  const renderTypeBadge = (type) => {
    switch (type) {
      case 'Teacher':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              color: '#4f46e5',
            }}
          >
            <GraduationCap size={13} />
            Teacher
          </span>
        );
      case 'Driver':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
            }}
          >
            <Bus size={13} />
            Driver
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
            }}
          >
            <Briefcase size={13} />
            Other Staff
          </span>
        );
    }
  };

  const renderStatusBadge = (status) => {
    if (status === 'Paid') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          Paid
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#d97706',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
        Pending
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '0px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Briefcase size={24} />
            </div>
            <div>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>
                Staff Management
              </h1>
              <p className="page-subtitle" style={{ margin: 0, fontSize: '0.925rem' }}>
                Staff salary calculation, unpaid leave deductions, and net payouts for Teachers, Drivers, and Support Staff
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Month Selector Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '4px 8px',
              gap: '6px',
            }}
          >
            <Calendar size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Salary Month:</span>
            <button
              onClick={handlePrevMonth}
              disabled={SALARY_MONTHS.indexOf(selectedMonth) === SALARY_MONTHS.length - 1}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '3px',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                opacity: SALARY_MONTHS.indexOf(selectedMonth) === SALARY_MONTHS.length - 1 ? 0.4 : 1,
              }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '0.9rem',
                fontWeight: 750,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '2px 4px',
                outline: 'none',
              }}
            >
              {SALARY_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button
              onClick={handleNextMonth}
              disabled={SALARY_MONTHS.indexOf(selectedMonth) === 0}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '3px',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                opacity: SALARY_MONTHS.indexOf(selectedMonth) === 0 ? 0.4 : 1,
              }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Add Staff Button */}
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Salary Summary Cards */}
      <div className="grid-4" style={{ gap: '16px' }}>
        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL STAFF</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>
            {summaryMetrics.totalStaffCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Teachers, Drivers & Personnel
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL MONTHLY SALARY</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
            {formatSalaryCurrency(summaryMetrics.totalMonthlySalary)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Gross base before deductions
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>LEAVE DEDUCTION</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#ef4444' }}>
            {formatSalaryCurrency(summaryMetrics.totalLeaveDeduction)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
            Deducted for unpaid absences
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL PAYABLE SALARY</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>
            {formatSalaryCurrency(summaryMetrics.totalPayableSalary)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Paid: {summaryMetrics.paidCount} | Pending: {summaryMetrics.pendingCount}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Staff Name, ID, Designation or Department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ width: '160px' }}>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ height: '40px' }}
            >
              <option value="All">All Staff</option>
              <option value="Teachers">Teachers</option>
              <option value="Drivers">Drivers</option>
              <option value="Other Staff">Other Staff</option>
            </select>
          </div>

          {/* Salary Status Filter */}
          <div style={{ width: '150px' }}>
            <select
              className="form-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ height: '40px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">🟢 Paid</option>
              <option value="Pending">🟡 Pending</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
              style={{ height: '40px', padding: '0 14px' }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Filter Summary Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>
            Showing <strong>{filteredStaff.length}</strong> of {staffList.length} staff records
          </span>
          <span>
            Active Salary Assessment: <strong>{selectedMonth}</strong>
          </span>
        </div>
      </div>

      {/* Main Staff Salary & Leave Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Staff Salary & Leave Roster</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              Dynamic deduction based on unpaid absences for {selectedMonth}
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Click on any staff record to review calculations or update leaves
          </span>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Staff</th>
                <th style={{ textAlign: 'left' }}>Type</th>
                <th style={{ textAlign: 'left' }}>Designation</th>
                <th style={{ textAlign: 'right' }}>Monthly Salary</th>
                <th style={{ textAlign: 'center' }}>Leave</th>
                <th style={{ textAlign: 'right' }}>Deduction</th>
                <th style={{ textAlign: 'right' }}>Payable Salary</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((item) => (
                <tr
                  key={item.id}
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  onClick={() => openSalaryModal(item)}
                >
                  <td style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          ID: {item.id} • {item.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'left' }}>{renderTypeBadge(item.type)}</td>
                  <td style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.designation}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.department}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatSalaryCurrency(item.monthlySalary)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {item.unpaidLeave > 0 ? (
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            color: '#dc2626',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          {item.unpaidLeave} Unpaid
                        </span>
                        {item.paidLeave > 0 && (
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                            ({item.paidLeave} Paid)
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#059669',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {item.paidLeave > 0 ? `${item.paidLeave} Paid` : '0 Leaves'}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: item.leaveDeduction > 0 ? '#ef4444' : 'var(--text-tertiary)' }}>
                    {item.leaveDeduction > 0 ? `-${formatSalaryCurrency(item.leaveDeduction)}` : '₹0'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                    {formatSalaryCurrency(item.netSalary)}
                  </td>
                  <td style={{ textAlign: 'center' }}>{renderStatusBadge(item.salaryStatus)}</td>
                  <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-outline"
                      onClick={() => openSalaryModal(item)}
                      style={{ padding: '6px 12px', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                    No staff records found matching your active filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Salary Details & Leave Management Modal */}
      {selectedStaffForSalary && liveSalaryPreview && (
        <Modal
          isOpen={Boolean(selectedStaffForSalary)}
          onClose={() => setSelectedStaffForSalary(null)}
          title="Staff Salary & Leave Assessment"
          subtitle={`Reviewing monthly compensation calculation for ${selectedMonth}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Staff Info Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
              }}
            >
              <img
                src={selectedStaffForSalary.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={selectedStaffForSalary.name}
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedStaffForSalary.name}
                  </h3>
                  {renderTypeBadge(selectedStaffForSalary.type)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Staff ID: <strong>{selectedStaffForSalary.id}</strong> • {selectedStaffForSalary.designation} ({selectedStaffForSalary.department})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Email: {selectedStaffForSalary.email} • Phone: {selectedStaffForSalary.phone}
                </div>
              </div>
              <div>{renderStatusBadge(selectedStaffForSalary.salaryStatus)}</div>
            </div>

            {/* Two Column Layout: Configuration & Live Calculation */}
            <div className="grid-2" style={{ gap: '16px' }}>
              {/* Left Column: Salary & Leave Configuration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Salary Details Card */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                  }}
                >
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Salary Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Monthly Base Salary:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {formatSalaryCurrency(selectedStaffForSalary.monthlySalary)}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Working Days:</span>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={editWorkingDays}
                        onChange={(e) => setEditWorkingDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="form-control"
                        style={{ width: '80px', height: '32px', textAlign: 'right', fontWeight: 700 }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Per Day Salary Rate:</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        {formatSalaryCurrency(liveSalaryPreview.perDaySalary)} / day
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Leave Management Card */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Leave Details & Management
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Only Unpaid Leave causes deduction
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Paid Leave (Allowed)</div>
                        <div style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ No salary reduction</div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={editPaidLeave}
                        onChange={(e) => setEditPaidLeave(Math.max(0, parseInt(e.target.value) || 0))}
                        className="form-control"
                        style={{ width: '80px', height: '32px', textAlign: 'right', fontWeight: 700 }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Unpaid Leave (Absence)</div>
                        <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>⚠ Deducted from monthly payout</div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={editUnpaidLeave}
                        onChange={(e) => setEditUnpaidLeave(Math.max(0, parseInt(e.target.value) || 0))}
                        className="form-control"
                        style={{ width: '80px', height: '32px', textAlign: 'right', fontWeight: 700, borderColor: '#ef4444' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Leave Days:</span>
                      <strong>{liveSalaryPreview.totalLeave} Days</strong>
                    </div>

                    <button
                      className="btn btn-outline"
                      onClick={handleSaveLeaveUpdates}
                      style={{ marginTop: '6px', fontSize: '0.825rem', width: '100%', justifyContent: 'center' }}
                    >
                      <Edit3 size={14} />
                      <span>Apply & Save Leave Days</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Salary Calculation Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Salary Calculation Breakdown
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Monthly Base Salary:</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatSalaryCurrency(liveSalaryPreview.monthlySalary)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Per Day Rate ({liveSalaryPreview.monthlySalary} / {liveSalaryPreview.totalWorkingDays}):
                        </span>
                        <span style={{ fontWeight: 600 }}>{formatSalaryCurrency(liveSalaryPreview.perDaySalary)}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                        <span>
                          Unpaid Leave Deduction ({liveSalaryPreview.unpaidLeave}d × {formatSalaryCurrency(liveSalaryPreview.perDaySalary)}):
                        </span>
                        <span style={{ fontWeight: 750 }}>
                          -{formatSalaryCurrency(liveSalaryPreview.leaveDeduction)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '0.825rem' }}>
                        <span>Paid Leave ({liveSalaryPreview.paidLeave}d allowed):</span>
                        <span style={{ fontWeight: 600 }}>₹0 Deduction</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Salary Payable Highlight Box */}
                  <div
                    style={{
                      marginTop: '20px',
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '2px solid #10b981',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Net Salary Payable ({selectedMonth})
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
                      {formatSalaryCurrency(liveSalaryPreview.netSalary)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Salary Status: <strong>{selectedStaffForSalary.salaryStatus}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedStaffForSalary.salaryStatus === 'Pending' ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleToggleSalaryStatus('Paid')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Mark as Paid</span>
                  </button>
                ) : (
                  <button
                    className="btn btn-outline"
                    onClick={() => handleToggleSalaryStatus('Pending')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', borderColor: '#d97706' }}
                  >
                    <Clock size={16} />
                    <span>Mark as Pending</span>
                  </button>
                )}
              </div>

              <button className="btn btn-secondary" onClick={() => setSelectedStaffForSalary(null)}>
                Close Window
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Staff Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Staff Member"
        subtitle="Add teacher, driver, or operational staff to institutional payroll records"
        size="md"
      >
        <form onSubmit={handleAddStaffSubmit}>
          <FormInput
            label="Staff Full Name"
            required
            value={newStaff.name}
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            placeholder="e.g. Ramesh Chandra"
          />

          <div className="grid-2">
            <Select
              label="Staff Category / Type"
              value={newStaff.type}
              onChange={(e) => setNewStaff({ ...newStaff, type: e.target.value })}
              options={['Teacher', 'Driver', 'Staff']}
            />
            <FormInput
              label="Designation / Role"
              required
              value={newStaff.designation}
              onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
              placeholder="e.g. Mathematics Teacher"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Email"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              placeholder="ramesh@school.edu"
            />
            <FormInput
              label="Phone Number"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              placeholder="+1 (555) 234-5678"
            />
          </div>

          <div className="grid-2">
            <Select
              label="Department"
              value={newStaff.department}
              onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
              options={['Mathematics & Computing', 'Languages & Arts', 'Science', 'Sports & Wellness', 'Transport', 'Finance & Accounts', 'Front Office', 'Library', 'Laboratories', 'Administration']}
            />
            <FormInput
              label="Monthly Base Salary (₹)"
              type="number"
              required
              value={newStaff.monthlySalary}
              onChange={(e) => setNewStaff({ ...newStaff, monthlySalary: Number(e.target.value) || 0 })}
              placeholder="30000"
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Personnel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
