import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { schoolDataService } from '../../services/schoolDataService';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import { BarChart } from '../../components/common/Charts';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Layers,
  Search,
  Calendar,
  Download,
  Eye,
  Clock,
  Receipt,
  BarChart3,
  RefreshCw,
  Users,
  GraduationCap,
  Briefcase,
  Bus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const MONTHS_LIST = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
];

export default function StaffFeesPage() {
  const { selectedSchool } = useAuth();
  const { success, info } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: dashboard, all, pending, paid, history, salary, reports
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const currentParam = searchParams.get('tab');
    if (currentParam && currentParam !== activeTab) {
      setActiveTab(currentParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const schoolId = selectedSchool?.id || 'SCH-001';

  // Selected Month state (Default: September 2026)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(8); // September 2026
  const activeMonthName = MONTHS_LIST[selectedMonthIndex] || 'September 2026';

  // State loaded from schoolDataService
  const [staffLedgers, setStaffLedgers] = useState(() => schoolDataService.getStaffFeeLedgers(schoolId));
  const [staffTransactions, setStaffTransactions] = useState(() => schoolDataService.getStaffFeeTransactions(schoolId));

  // Employee category filter: 'All' | 'Teacher' | 'Staff' | 'Driver'
  const [employeeCategory, setEmployeeCategory] = useState('All');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('All');
  const [selectedSession, setSelectedSession] = useState('2026-27');

  // Modals state
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [selectedEmployeeForPayment, setSelectedEmployeeForPayment] = useState(null);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);

  // Form state for Record Payment
  const [paymentFormAmount, setPaymentFormAmount] = useState('');
  const [paymentFormMethod, setPaymentFormMethod] = useState('Bank Transfer');
  const [paymentFormDate, setPaymentFormDate] = useState(() => '2026-09-09');
  const [paymentFormTxnId, setPaymentFormTxnId] = useState('');
  const [paymentFormNotes, setPaymentFormNotes] = useState('');
  const [paymentFormError, setPaymentFormError] = useState('');

  // Reload Helper
  const reloadData = () => {
    setStaffLedgers(schoolDataService.getStaffFeeLedgers(schoolId));
    setStaffTransactions(schoolDataService.getStaffFeeTransactions(schoolId));
    info('Staff fee ledgers synchronized');
  };

  // Helper currency formatter
  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonthIndex > 0) {
      setSelectedMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex < MONTHS_LIST.length - 1) {
      setSelectedMonthIndex((prev) => prev + 1);
    }
  };

  // Filtered Ledgers
  const filteredLedgers = useMemo(() => {
    return staffLedgers.filter((emp) => {
      // Category filter
      if (employeeCategory !== 'All' && emp.employeeType !== employeeCategory) {
        return false;
      }

      // Search matching: name, ID, phone, department
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (emp.employeeName && emp.employeeName.toLowerCase().includes(q)) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(q)) ||
        (emp.phone && emp.phone.toLowerCase().includes(q)) ||
        (emp.department && emp.department.toLowerCase().includes(q)) ||
        (emp.email && emp.email.toLowerCase().includes(q));

      // Status filter
      let matchStatus = true;
      if (filterStatus === 'Paid') matchStatus = emp.status === 'PAID';
      else if (filterStatus === 'Pending') matchStatus = emp.status === 'PENDING';
      else if (filterStatus === 'Partially Paid') matchStatus = emp.status === 'PARTIAL';

      // Department filter
      const matchDept = filterDepartment === 'All' || emp.department === filterDepartment;

      return matchSearch && matchStatus && matchDept;
    });
  }, [staffLedgers, employeeCategory, searchQuery, filterStatus, filterDepartment]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalEmployees = staffLedgers.length;
    const totalSalary = staffLedgers.reduce((acc, emp) => acc + (Number(emp.monthlySalary) || 0), 0);
    const paidThisMonth = staffLedgers.reduce((acc, emp) => acc + (Number(emp.paidAmount) || 0), 0);
    const pendingThisMonth = staffLedgers.reduce((acc, emp) => acc + (Number(emp.pendingAmount) || 0), 0);

    const paidCount = staffLedgers.filter((emp) => emp.status === 'PAID').length;
    const partialCount = staffLedgers.filter((emp) => emp.status === 'PARTIAL').length;
    const pendingCount = staffLedgers.filter((emp) => emp.status === 'PENDING').length;

    // By Employee Category
    const teachers = staffLedgers.filter((emp) => emp.employeeType === 'Teacher');
    const staffMembers = staffLedgers.filter((emp) => emp.employeeType === 'Staff');
    const drivers = staffLedgers.filter((emp) => emp.employeeType === 'Driver');

    const teacherTotalSalary = teachers.reduce((acc, emp) => acc + (Number(emp.monthlySalary) || 0), 0);
    const teacherPaid = teachers.reduce((acc, emp) => acc + (Number(emp.paidAmount) || 0), 0);
    const teacherPending = teachers.reduce((acc, emp) => acc + (Number(emp.pendingAmount) || 0), 0);

    const staffTotalSalary = staffMembers.reduce((acc, emp) => acc + (Number(emp.monthlySalary) || 0), 0);
    const staffPaid = staffMembers.reduce((acc, emp) => acc + (Number(emp.paidAmount) || 0), 0);
    const staffPending = staffMembers.reduce((acc, emp) => acc + (Number(emp.pendingAmount) || 0), 0);

    const driverTotalSalary = drivers.reduce((acc, emp) => acc + (Number(emp.monthlySalary) || 0), 0);
    const driverPaid = drivers.reduce((acc, emp) => acc + (Number(emp.paidAmount) || 0), 0);
    const driverPending = drivers.reduce((acc, emp) => acc + (Number(emp.pendingAmount) || 0), 0);

    return {
      totalEmployees,
      totalSalary,
      paidThisMonth,
      pendingThisMonth,
      paidCount,
      partialCount,
      pendingCount,
      totalOutstanding: pendingThisMonth,
      byCategory: {
        teachers: { count: teachers.length, total: teacherTotalSalary, paid: teacherPaid, pending: teacherPending },
        staff: { count: staffMembers.length, total: staffTotalSalary, paid: staffPaid, pending: staffPending },
        drivers: { count: drivers.length, total: driverTotalSalary, paid: driverPaid, pending: driverPending },
      },
    };
  }, [staffLedgers]);

  // Open Record Payment Modal for specific employee
  const handleOpenPaymentModal = (employee) => {
    setSelectedEmployeeForPayment(employee || staffLedgers[0]);
    setPaymentFormAmount('');
    setPaymentFormMethod('Bank Transfer');
    setPaymentFormDate('2026-09-09');
    setPaymentFormTxnId(`TXN-SAL-${Date.now().toString().slice(-4)}`);
    setPaymentFormNotes('');
    setPaymentFormError('');
    setIsRecordPaymentModalOpen(true);
  };

  // Handle Record Payment Submission with Strict Validation
  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    setPaymentFormError('');

    if (!selectedEmployeeForPayment) {
      setPaymentFormError('Please select a valid employee.');
      return;
    }

    const amountNum = Number(paymentFormAmount);
    const remaining = Number(selectedEmployeeForPayment.pendingAmount) || 0;

    if (!amountNum || amountNum <= 0) {
      setPaymentFormError('Payment amount must be greater than ₹0.');
      return;
    }

    if (amountNum > remaining) {
      setPaymentFormError(`Payment amount cannot exceed the pending balance of ${formatCurrency(remaining)}.`);
      return;
    }

    // Call service to update state
    schoolDataService.recordStaffPayment({
      employeeId: selectedEmployeeForPayment.employeeId,
      amount: amountNum,
      paymentMonth: activeMonthName,
      paymentDate: paymentFormDate,
      paymentMethod: paymentFormMethod,
      transactionId: paymentFormTxnId || `TXN-SAL-${Date.now().toString().slice(-4)}`,
      notes: paymentFormNotes,
      schoolId,
    });

    setStaffLedgers(schoolDataService.getStaffFeeLedgers(schoolId));
    setStaffTransactions(schoolDataService.getStaffFeeTransactions(schoolId));
    setIsRecordPaymentModalOpen(false);

    success(`Payment of ${formatCurrency(amountNum)} recorded for ${selectedEmployeeForPayment.employeeName}!`);
  };

  // Distinct departments list for filter
  const departmentsList = useMemo(() => {
    return Array.from(new Set(staffLedgers.map((e) => e.department))).filter(Boolean);
  }, [staffLedgers]);

  // Render Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
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
      case 'PARTIAL':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
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
            Partially Paid
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            Pending
          </span>
        );
    }
  };

  // Render Employee Type Badge
  const renderTypeBadge = (type) => {
    switch (type) {
      case 'Teacher':
        return (
          <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', fontWeight: 700 }}>
            <GraduationCap size={12} /> Teacher
          </span>
        );
      case 'Staff':
        return (
          <span className="badge" style={{ backgroundColor: 'var(--purple-light)', color: 'var(--purple-text)', fontWeight: 700 }}>
            <Briefcase size={12} /> Staff
          </span>
        );
      case 'Driver':
        return (
          <span className="badge" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-text)', fontWeight: 700 }}>
            <Bus size={12} /> Driver
          </span>
        );
      default:
        return <span className="badge badge-gray">{type}</span>;
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0,
              }}
            >
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>
                Staff Fee Management
              </h1>
              <p className="page-subtitle" style={{ margin: 0, fontSize: '0.925rem' }}>
                Manage salary and payment records for teachers, staff and drivers.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Month Switcher Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '3px',
            }}
          >
            <button
              onClick={handlePrevMonth}
              disabled={selectedMonthIndex === 0}
              className="btn btn-icon btn-sm"
              style={{ border: 'none' }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ padding: '0 10px', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px', color: 'var(--primary)' }} />
              {activeMonthName}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={selectedMonthIndex === MONTHS_LIST.length - 1}
              className="btn btn-icon btn-sm"
              style={{ border: 'none' }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            className="btn btn-outline"
            onClick={reloadData}
            title="Sync Data"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} />
            <span>Sync</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => handleOpenPaymentModal(staffLedgers.find((e) => e.status !== 'PAID') || staffLedgers[0])}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CreditCard size={16} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div
        className="nav-tabs-scroll"
        style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          maxWidth: '100%',
          paddingBottom: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {[
          { key: 'dashboard', label: 'Staff Fee Dashboard', icon: Layers },
          { key: 'all', label: 'All Employees', icon: Users, badge: metrics.totalEmployees },
          { key: 'pending', label: 'Pending Payments', icon: AlertCircle, badge: metrics.pendingCount + metrics.partialCount, badgeColor: '#ef4444' },
          { key: 'paid', label: 'Paid Payments', icon: CheckCircle2, badge: metrics.paidCount, badgeColor: '#10b981' },
          { key: 'history', label: 'Payment History', icon: Receipt },
          { key: 'salary', label: 'Salary Payments', icon: Wallet },
          { key: 'reports', label: 'Payment Reports', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 15px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 750 : 550,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} style={{ color: isActive ? '#ffffff' : 'inherit' }} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : tab.badgeColor ? `${tab.badgeColor}20` : 'var(--bg-tertiary)',
                    color: isActive ? '#ffffff' : tab.badgeColor || 'var(--text-secondary)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Top 6 Summary Cards (Consistent CRM Design) */}
      <div className="grid-3" style={{ marginBottom: '22px' }}>
        <StatCard
          title="Total Employees"
          value={metrics.totalEmployees}
          icon={Users}
          color="indigo"
          subtitle={`${metrics.byCategory.teachers.count} Teachers • ${metrics.byCategory.staff.count} Staff • ${metrics.byCategory.drivers.count} Drivers`}
        />
        <StatCard
          title="Total Monthly Salary"
          value={formatCurrency(metrics.totalSalary)}
          icon={Wallet}
          color="sky"
          subtitle={`Payroll for ${activeMonthName}`}
        />
        <StatCard
          title="Paid This Month"
          value={formatCurrency(metrics.paidThisMonth)}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${metrics.paidCount} of ${metrics.totalEmployees} employees fully cleared`}
        />
      </div>

      <div className="grid-3" style={{ marginBottom: '22px' }}>
        <StatCard
          title="Pending This Month"
          value={formatCurrency(metrics.pendingThisMonth)}
          icon={AlertCircle}
          color="rose"
          subtitle={`${metrics.pendingCount} unpaid employees`}
        />
        <StatCard
          title="Partially Paid"
          value={`${metrics.partialCount} Employees`}
          icon={Clock}
          color="amber"
          subtitle={`${formatCurrency(staffLedgers.filter((e) => e.status === 'PARTIAL').reduce((acc, e) => acc + e.pendingAmount, 0))} balance due`}
        />
        <StatCard
          title="Total Outstanding"
          value={formatCurrency(metrics.totalOutstanding)}
          icon={AlertTriangle}
          color="purple"
          subtitle={`Combined pending salary liability`}
        />
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DASHBOARD & ALL EMPLOYEES VIEW */}
      {/* ========================================================================= */}
      {(activeTab === 'dashboard' || activeTab === 'all') && (
        <div>
          {/* Employee Category Tabs: All | Teachers | Staff | Drivers */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '4px',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '100%',
                overflowX: 'auto',
              }}
            >
              {[
                { key: 'All', label: 'All Employees', count: metrics.totalEmployees },
                { key: 'Teacher', label: 'Teachers', count: metrics.byCategory.teachers.count },
                { key: 'Staff', label: 'Staff', count: metrics.byCategory.staff.count },
                { key: 'Driver', label: 'Drivers', count: metrics.byCategory.drivers.count },
              ].map((cat) => {
                const isSelected = employeeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setEmployeeCategory(cat.key)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 750 : 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{cat.label}</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-tertiary)',
                        color: isSelected ? '#ffffff' : 'var(--text-tertiary)',
                      }}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredLedgers.length}</strong> records for <strong>{activeMonthName}</strong>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              alignItems: 'center',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
              <Search
                size={16}
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
                className="form-input"
                placeholder="Search by name, ID, phone, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ minWidth: '140px' }}>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Department Filter */}
            <div style={{ minWidth: '160px' }}>
              <select
                className="form-select"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="All">All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Filter */}
            <div style={{ minWidth: '130px' }}>
              <select
                className="form-select"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="2026-27">Session 2026-27</option>
                <option value="2025-26">Session 2025-26</option>
              </select>
            </div>

            {/* Clear button if active */}
            {(searchQuery || filterStatus !== 'All' || filterDepartment !== 'All' || employeeCategory !== 'All') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('All');
                  setFilterDepartment('All');
                  setEmployeeCategory('All');
                }}
                style={{ height: '38px' }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Main Employee Payment Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Employee Salary & Payment Ledger
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Payroll records for {activeMonthName}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const csvContent =
                      'data:text/csv;charset=utf-8,' +
                      ['Employee,ID,Type,Department,Monthly Salary,Paid,Pending,Status,Date'].join(',') +
                      '\n' +
                      filteredLedgers
                        .map((e) =>
                          [
                            `"${e.employeeName}"`,
                            e.employeeId,
                            e.employeeType,
                            `"${e.department}"`,
                            e.monthlySalary,
                            e.paidAmount,
                            e.pendingAmount,
                            e.status,
                            e.paymentDate || '—',
                          ].join(',')
                        )
                        .join('\n');
                    const encoded = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encoded);
                    link.setAttribute('download', `Staff_Fees_${activeMonthName.replace(' ', '_')}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Type</th>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>Monthly Salary</th>
                    <th style={{ textAlign: 'right' }}>Paid</th>
                    <th style={{ textAlign: 'right' }}>Pending</th>
                    <th>Payment Status</th>
                    <th>Payment Date</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
                        <Wallet size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <p style={{ fontWeight: 600 }}>No employee payment records match your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLedgers.map((emp) => (
                      <tr key={emp.id || emp.employeeId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                backgroundColor:
                                  emp.employeeType === 'Teacher'
                                    ? 'var(--primary-light)'
                                    : emp.employeeType === 'Staff'
                                    ? 'var(--purple-light)'
                                    : 'var(--warning-light)',
                                color:
                                  emp.employeeType === 'Teacher'
                                    ? 'var(--primary-text)'
                                    : emp.employeeType === 'Staff'
                                    ? 'var(--purple-text)'
                                    : 'var(--warning-text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                flexShrink: 0,
                              }}
                            >
                              {emp.employeeName.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                {emp.employeeName}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {emp.phone || emp.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{emp.employeeId}</strong>
                        </td>
                        <td>{renderTypeBadge(emp.employeeType)}</td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{emp.department}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(emp.monthlySalary)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          {formatCurrency(emp.paidAmount)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: emp.pendingAmount > 0 ? '#dc2626' : 'var(--text-tertiary)',
                          }}
                        >
                          {formatCurrency(emp.pendingAmount)}
                        </td>
                        <td>{renderStatusBadge(emp.status)}</td>
                        <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {emp.paymentDate || '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedEmployeeForView(emp)}
                              title="View Payment Details"
                              style={{ padding: '5px 10px', fontSize: '0.775rem' }}
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>

                            {emp.status !== 'PAID' && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleOpenPaymentModal(emp)}
                                title="Record Salary Payment"
                                style={{ padding: '5px 10px', fontSize: '0.775rem' }}
                              >
                                <CreditCard size={13} />
                                <span>Pay</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENDING PAYMENTS TAB ("Is month kis-kis ka paisa baki hai?") */}
      {/* ========================================================================= */}
      {activeTab === 'pending' && (
        <div>
          {/* Top Banner Alert for Principal */}
          <div
            style={{
              padding: '18px 24px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                }}
              >
                ⚠️
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#b91c1c' }}>
                  Pending Salary Payments for {activeMonthName}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#991b1b' }}>
                  Total <strong>{metrics.pendingCount + metrics.partialCount}</strong> employees have outstanding salary balances totaling{' '}
                  <strong>{formatCurrency(metrics.totalOutstanding)}</strong>.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  const firstPending = staffLedgers.find((e) => e.status !== 'PAID');
                  if (firstPending) handleOpenPaymentModal(firstPending);
                }}
              >
                <CreditCard size={14} /> Clear Next Pending
              </button>
            </div>
          </div>

          {/* Pending Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>Monthly Salary</th>
                    <th style={{ textAlign: 'right' }}>Paid</th>
                    <th style={{ textAlign: 'right' }}>Pending Amount</th>
                    <th>Month</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staffLedgers.filter((e) => e.status !== 'PAID').length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#059669' }}>
                        <CheckCircle2 size={36} style={{ marginBottom: '8px' }} />
                        <p style={{ fontWeight: 700, fontSize: '1rem' }}>All staff salaries are 100% cleared for {activeMonthName}!</p>
                      </td>
                    </tr>
                  ) : (
                    staffLedgers
                      .filter((e) => e.status !== 'PAID')
                      .map((emp) => (
                        <tr key={emp.employeeId}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.employeeName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {emp.employeeId}</div>
                          </td>
                          <td>{renderTypeBadge(emp.employeeType)}</td>
                          <td>{emp.department}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(emp.monthlySalary)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                            {formatCurrency(emp.paidAmount)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>
                            {formatCurrency(emp.pendingAmount)}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{activeMonthName}</td>
                          <td>{renderStatusBadge(emp.status)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenPaymentModal(emp)}
                              style={{ padding: '4px 10px' }}
                            >
                              <CreditCard size={13} /> Record Payment
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAID PAYMENTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'paid' && (
        <div>
          {/* Summary Box */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={24} color="#10b981" />
              <div>
                <strong style={{ color: '#065f46', fontSize: '0.95rem' }}>
                  {metrics.paidCount} Employees Fully Cleared ({activeMonthName})
                </strong>
                <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                  Total disbursed amount: <strong>{formatCurrency(staffLedgers.filter((e) => e.status === 'PAID').reduce((acc, e) => acc + e.paidAmount, 0))}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Type</th>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>Monthly Salary</th>
                    <th style={{ textAlign: 'right' }}>Paid Amount</th>
                    <th>Payment Date</th>
                    <th>Payment Method</th>
                    <th>Receipt / Txn No.</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staffLedgers.filter((e) => e.status === 'PAID').map((emp) => (
                    <tr key={emp.employeeId}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{emp.employeeName}</strong>
                      </td>
                      <td>{emp.employeeId}</td>
                      <td>{renderTypeBadge(emp.employeeType)}</td>
                      <td>{emp.department}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(emp.monthlySalary)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {formatCurrency(emp.paidAmount)}
                      </td>
                      <td style={{ fontSize: '0.825rem' }}>{emp.paymentDate}</td>
                      <td>
                        <span className="badge badge-gray">{emp.paymentMethod || 'Bank Transfer'}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{emp.transactionId || 'TXN-90812'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedEmployeeForView(emp)}
                          style={{ padding: '4px 10px' }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PAYMENT HISTORY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div>
          <div
            className="card"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search history by employee, ID, receipt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ minWidth: '140px' }}>
              <select
                className="form-select"
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="All">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Payment Date</th>
                    <th>Receipt No.</th>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Type</th>
                    <th>Payment Month</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Payment Method</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {staffTransactions
                    .filter((t) => {
                      const q = searchQuery.toLowerCase().trim();
                      const match =
                        !q ||
                        t.employeeName?.toLowerCase().includes(q) ||
                        t.employeeId?.toLowerCase().includes(q) ||
                        t.receiptNo?.toLowerCase().includes(q) ||
                        t.transactionId?.toLowerCase().includes(q);
                      const matchMethod = filterPaymentMethod === 'All' || t.paymentMethod === filterPaymentMethod;
                      return match && matchMethod;
                    })
                    .map((txn) => (
                      <tr key={txn.id}>
                        <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{txn.paymentDate}</td>
                        <td>
                          <span className="badge badge-primary" style={{ fontFamily: 'monospace' }}>
                            {txn.receiptNo}
                          </span>
                        </td>
                        <td>
                          <strong>{txn.employeeName}</strong>
                        </td>
                        <td>{txn.employeeId}</td>
                        <td>{renderTypeBadge(txn.employeeType)}</td>
                        <td>{txn.paymentMonth}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                          {formatCurrency(txn.amount)}
                        </td>
                        <td>
                          <span className="badge badge-gray">{txn.paymentMethod}</span>
                        </td>
                        <td style={{ fontSize: '0.775rem', fontFamily: 'monospace' }}>{txn.transactionId}</td>
                        <td>
                          <span className="badge badge-success">Completed</span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{txn.notes || '—'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SALARY PAYMENTS OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'salary' && (
        <div>
          {/* Monthly Payroll Summary Cards by Category */}
          <div className="grid-3" style={{ marginBottom: '22px' }}>
            <div className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Teaching Faculty</span>
                <GraduationCap size={20} color="#4f46e5" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatCurrency(metrics.byCategory.teachers.total)}
              </div>
              <div style={{ fontSize: '0.825rem', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#059669' }}>Paid: {formatCurrency(metrics.byCategory.teachers.paid)}</span>
                <span style={{ color: '#dc2626' }}>Pending: {formatCurrency(metrics.byCategory.teachers.pending)}</span>
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Administrative Staff</span>
                <Briefcase size={20} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatCurrency(metrics.byCategory.staff.total)}
              </div>
              <div style={{ fontSize: '0.825rem', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#059669' }}>Paid: {formatCurrency(metrics.byCategory.staff.paid)}</span>
                <span style={{ color: '#dc2626' }}>Pending: {formatCurrency(metrics.byCategory.staff.pending)}</span>
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Transport Drivers</span>
                <Bus size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatCurrency(metrics.byCategory.drivers.total)}
              </div>
              <div style={{ fontSize: '0.825rem', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#059669' }}>Paid: {formatCurrency(metrics.byCategory.drivers.paid)}</span>
                <span style={{ color: '#dc2626' }}>Pending: {formatCurrency(metrics.byCategory.drivers.pending)}</span>
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px' }}>Salary Breakdown by Department</h3>
            <div className="grid-2">
              {departmentsList.map((dept) => {
                const deptEmps = staffLedgers.filter((e) => e.department === dept);
                const deptSalary = deptEmps.reduce((acc, e) => acc + e.monthlySalary, 0);
                const deptPaid = deptEmps.reduce((acc, e) => acc + e.paidAmount, 0);
                const deptPending = deptEmps.reduce((acc, e) => acc + e.pendingAmount, 0);
                return (
                  <div
                    key={dept}
                    style={{
                      padding: '14px 18px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{dept}</strong>
                      <span className="badge badge-gray">{deptEmps.length} Employees</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Total: <strong>{formatCurrency(deptSalary)}</strong></span>
                      <span style={{ color: '#059669' }}>Paid: <strong>{formatCurrency(deptPaid)}</strong></span>
                      <span style={{ color: deptPending > 0 ? '#dc2626' : 'var(--text-secondary)' }}>
                        Pending: <strong>{formatCurrency(deptPending)}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PAYMENT REPORTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div>
          <div className="grid-2" style={{ marginBottom: '20px' }}>
            {/* Monthly Trend */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px' }}>Monthly Salary Expense Trend</h3>
              <BarChart
                height={220}
                data={[
                  { label: 'May', value: 380000, color: '#6366f1' },
                  { label: 'Jun', value: 385000, color: '#6366f1' },
                  { label: 'Jul', value: 390000, color: '#4f46e5' },
                  { label: 'Aug', value: 392000, color: '#4338ca' },
                  { label: 'Sep', value: metrics.paidThisMonth, color: '#10b981' },
                ]}
              />
            </div>

            {/* Category Distribution */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px' }}>Salary Expense by Employee Type</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <strong>Teachers ({metrics.byCategory.teachers.count})</strong>
                    <span>{formatCurrency(metrics.byCategory.teachers.total)}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(metrics.byCategory.teachers.total / metrics.totalSalary) * 100}%`, height: '100%', backgroundColor: '#4f46e5' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <strong>Staff ({metrics.byCategory.staff.count})</strong>
                    <span>{formatCurrency(metrics.byCategory.staff.total)}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(metrics.byCategory.staff.total / metrics.totalSalary) * 100}%`, height: '100%', backgroundColor: '#8b5cf6' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <strong>Drivers ({metrics.byCategory.drivers.count})</strong>
                    <span>{formatCurrency(metrics.byCategory.drivers.total)}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(metrics.byCategory.drivers.total / metrics.totalSalary) * 100}%`, height: '100%', backgroundColor: '#f59e0b' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD PAYMENT MODAL */}
      {/* ========================================================================= */}
      {isRecordPaymentModalOpen && selectedEmployeeForPayment && (
        <Modal
          isOpen={isRecordPaymentModalOpen}
          onClose={() => setIsRecordPaymentModalOpen(false)}
          title="Record Staff Payment"
          subtitle={`Disburse salary to ${selectedEmployeeForPayment.employeeName} (${selectedEmployeeForPayment.employeeId})`}
          size="md"
        >
          <form onSubmit={handleRecordPaymentSubmit}>
            {paymentFormError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid #ef4444',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                ⚠️ {paymentFormError}
              </div>
            )}

            {/* Readonly Summary Info */}
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                marginBottom: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Employee:</span>{' '}
                <strong>{selectedEmployeeForPayment.employeeName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Type:</span>{' '}
                <strong>{selectedEmployeeForPayment.employeeType}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Department:</span>{' '}
                <strong>{selectedEmployeeForPayment.department}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Payment Month:</span>{' '}
                <strong>{activeMonthName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Monthly Salary:</span>{' '}
                <strong style={{ color: 'var(--primary)' }}>{formatCurrency(selectedEmployeeForPayment.monthlySalary)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Previously Paid:</span>{' '}
                <strong style={{ color: '#059669' }}>{formatCurrency(selectedEmployeeForPayment.paidAmount)}</strong>
              </div>
              <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Remaining Balance Due:</span>{' '}
                <strong style={{ color: '#dc2626', fontSize: '1rem' }}>
                  {formatCurrency(selectedEmployeeForPayment.pendingAmount)}
                </strong>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="form-group">
              <label className="form-label">Payment Amount (₹) *</label>
              <input
                type="number"
                className="form-input"
                required
                min="1"
                max={selectedEmployeeForPayment.pendingAmount}
                placeholder={`Enter amount (Max: ${selectedEmployeeForPayment.pendingAmount})`}
                value={paymentFormAmount}
                onChange={(e) => setPaymentFormAmount(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPaymentFormAmount(String(selectedEmployeeForPayment.pendingAmount))}
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  Pay Full Balance ({formatCurrency(selectedEmployeeForPayment.pendingAmount)})
                </button>
                {selectedEmployeeForPayment.pendingAmount > 5000 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPaymentFormAmount(String(Math.round(selectedEmployeeForPayment.pendingAmount / 2)))}
                    style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  >
                    Pay 50% ({formatCurrency(Math.round(selectedEmployeeForPayment.pendingAmount / 2))})
                  </button>
                )}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Payment Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={paymentFormDate}
                  onChange={(e) => setPaymentFormDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentFormMethod}
                  onChange={(e) => setPaymentFormMethod(e.target.value)}
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction / Receipt Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. TXN-SAL-9801 or Cheque #"
                value={paymentFormTxnId}
                onChange={(e) => setPaymentFormTxnId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Add any supporting remarks..."
                value={paymentFormNotes}
                onChange={(e) => setPaymentFormNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsRecordPaymentModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Record Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EMPLOYEE PAYMENT DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedEmployeeForView && (
        <Modal
          isOpen={Boolean(selectedEmployeeForView)}
          onClose={() => setSelectedEmployeeForView(null)}
          title="Employee Salary & Payment Profile"
          subtitle={`${selectedEmployeeForView.employeeName} (${selectedEmployeeForView.employeeId})`}
          size="lg"
        >
          <div>
            {/* Employee Information Card */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-tertiary)',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Name</div>
                <strong>{selectedEmployeeForView.employeeName}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Employee ID</div>
                <strong>{selectedEmployeeForView.employeeId}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Employee Type</div>
                <div>{renderTypeBadge(selectedEmployeeForView.employeeType)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Department</div>
                <strong>{selectedEmployeeForView.department}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Phone</div>
                <strong>{selectedEmployeeForView.phone || '—'}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Email</div>
                <strong>{selectedEmployeeForView.email || '—'}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Joining Date</div>
                <strong>{selectedEmployeeForView.joiningDate || '—'}</strong>
              </div>
            </div>

            {/* Current Month Payment Overview */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800 }}>
                Current Month: {activeMonthName}
              </h4>
              <div className="grid-4">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Monthly Salary</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatCurrency(selectedEmployeeForView.monthlySalary)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Paid Amount</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                    {formatCurrency(selectedEmployeeForView.paidAmount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Pending Amount</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedEmployeeForView.pendingAmount > 0 ? '#dc2626' : 'var(--text-tertiary)' }}>
                    {formatCurrency(selectedEmployeeForView.pendingAmount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Payment Status</div>
                  <div style={{ marginTop: '4px' }}>{renderStatusBadge(selectedEmployeeForView.status)}</div>
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800 }}>Past Months Payment History</h4>
              <div className="table-container" style={{ border: '1px solid var(--border-color)' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th style={{ textAlign: 'right' }}>Salary</th>
                      <th style={{ textAlign: 'right' }}>Paid</th>
                      <th style={{ textAlign: 'right' }}>Pending</th>
                      <th>Payment Date</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEmployeeForView.history && selectedEmployeeForView.history.length > 0 ? (
                      selectedEmployeeForView.history.map((h, i) => (
                        <tr key={i}>
                          <td>
                            <strong>{h.month}</strong>
                          </td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(h.salary)}</td>
                          <td style={{ textAlign: 'right', color: '#059669', fontWeight: 700 }}>
                            {formatCurrency(h.paid)}
                          </td>
                          <td style={{ textAlign: 'right', color: h.pending > 0 ? '#dc2626' : 'var(--text-tertiary)' }}>
                            {formatCurrency(h.pending)}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{h.date || '—'}</td>
                          <td>
                            <span className="badge badge-gray">{h.method || 'Bank Transfer'}</span>
                          </td>
                          <td>
                            <span className={`badge ${h.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
                          No previous transaction history recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedEmployeeForView(null)}>
                Close
              </button>
              {selectedEmployeeForView.status !== 'PAID' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const emp = selectedEmployeeForView;
                    setSelectedEmployeeForView(null);
                    handleOpenPaymentModal(emp);
                  }}
                >
                  <CreditCard size={15} /> Record Payment
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
