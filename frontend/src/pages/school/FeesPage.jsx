import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { schoolDataService, SCHOOL_CLASSES } from '../../services/schoolDataService';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import { FormInput, Select } from '../../components/common/FormInput';
import {
  DollarSign,
  Plus,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Layers,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  FileText,
  BarChart3,
  PieChart,
  Sliders,
  ChevronDown,
  User,
  Phone,
  Check,
  RefreshCw,
  Settings,
  ArrowRight,
} from 'lucide-react';

export default function FeesPage() {
  const { selectedSchool } = useAuth();
  const { success, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: dashboard, students, collection, pending, overdue, late-fine, history, reports (Fee Structure removed)
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const initialTab = tabFromUrl === 'structure' ? 'dashboard' : tabFromUrl;
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const currentParam = searchParams.get('tab');
    if (currentParam === 'structure') {
      setActiveTab('dashboard');
      setSearchParams({ tab: 'dashboard' });
    } else if (currentParam && currentParam !== activeTab) {
      setActiveTab(currentParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const schoolId = selectedSchool?.id || 'SCH-001';

  // State loaded from schoolDataService
  const [studentLedgers, setStudentLedgers] = useState(() => schoolDataService.getStudentFeeLedgers(schoolId));
  const [feeTransactions, setFeeTransactions] = useState(() => schoolDataService.getFeeTransactions(schoolId));
  const [fineSettings, setFineSettings] = useState(() => schoolDataService.getLateFineSettings(schoolId));

  // Modals state
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [selectedFineForDetails, setSelectedFineForDetails] = useState(null);
  const [isFineSettingsModalOpen, setIsFineSettingsModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState(null); // { studentId, studentName, rollNumber, class, section, pendingAmount, totalFee }
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState(null);

  // Filters state for Student Fees
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSession, setSelectedSession] = useState('2026-27');

  // Filters state for Late Fine section
  const [fineSearchQuery, setFineSearchQuery] = useState('');
  const [fineClass, setFineClass] = useState('All');
  const [fineSection, setFineSection] = useState('All');
  const [fineStatus, setFineStatus] = useState('All');
  const [fineSession, setFineSession] = useState('2026-27');

  // Dashboard class overview selector
  const [dashboardOverviewClass, setDashboardOverviewClass] = useState('Class 9');

  // Refresh helper
  const reloadData = () => {
    setStudentLedgers(schoolDataService.getStudentFeeLedgers(schoolId));
    setFeeTransactions(schoolDataService.getFeeTransactions(schoolId));
    setFineSettings(schoolDataService.getLateFineSettings(schoolId));
  };

  // Helper currency formatter
  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  // Filtered Ledgers for Student Fees
  const filteredLedgers = useMemo(() => {
    return studentLedgers.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.studentName && item.studentName.toLowerCase().includes(q)) ||
        (item.studentId && item.studentId.toLowerCase().includes(q)) ||
        (item.rollNumber && item.rollNumber.toLowerCase().includes(q)) ||
        (item.parentName && item.parentName.toLowerCase().includes(q)) ||
        (item.parentPhone && item.parentPhone.toLowerCase().includes(q));

      const matchClass = selectedClass === 'All' || item.class === selectedClass;
      const matchSection = selectedSection === 'All' || item.section === selectedSection;
      const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;
      const matchSession = !selectedSession || item.academicSession === selectedSession;

      return matchSearch && matchClass && matchSection && matchStatus && matchSession;
    });
  }, [studentLedgers, searchQuery, selectedClass, selectedSection, selectedStatus, selectedSession]);

  // Filtered Late Fine Records
  const filteredFineRecords = useMemo(() => {
    return studentLedgers
      .filter((item) => {
        const q = fineSearchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          (item.studentName && item.studentName.toLowerCase().includes(q)) ||
          (item.studentId && item.studentId.toLowerCase().includes(q)) ||
          (item.rollNumber && item.rollNumber.toLowerCase().includes(q)) ||
          (item.parentName && item.parentName.toLowerCase().includes(q)) ||
          (item.parentPhone && item.parentPhone.toLowerCase().includes(q));

        const matchClass = fineClass === 'All' || item.class === fineClass;
        const matchSection = fineSection === 'All' || item.section === fineSection;
        const matchSession = !fineSession || item.academicSession === fineSession;

        let matchStatus = true;
        if (fineStatus === 'Paid') matchStatus = item.status === 'PAID';
        else if (fineStatus === 'Pending') matchStatus = item.status === 'PENDING';
        else if (fineStatus === 'Partially Paid') matchStatus = item.status === 'PARTIAL';
        else if (fineStatus === 'Overdue') matchStatus = item.status === 'OVERDUE';

        return matchSearch && matchClass && matchSection && matchSession && matchStatus;
      })
      .map((item) => {
        const fineTypeDisplay = fineSettings.fineType === 'fixed'
          ? `Fixed (₹${fineSettings.fixedAmount || 500})`
          : `Per Day (₹${fineSettings.fineAmount || 50}/d)`;

        return {
          ...item,
          fineTypeDisplay,
        };
      });
  }, [studentLedgers, fineSearchQuery, fineClass, fineSection, fineStatus, fineSession, fineSettings]);

  // Late Fine Summary Metrics
  const fineMetrics = useMemo(() => {
    const studentsWithFine = studentLedgers.filter((l) => (l.fineAmount > 0 || l.lateDays > 0)).length;
    const finePending = studentLedgers.reduce((acc, l) => acc + (Number(l.fineAmount) || 0), 0);
    const fineCollected = 75000; // base realized fine
    const totalLateFines = fineCollected + finePending;

    return {
      totalLateFines,
      fineCollected,
      finePending,
      studentsWithFine,
    };
  }, [studentLedgers]);

  // Summary Metrics for Dashboard
  const metrics = useMemo(() => {
    const totalStudents = studentLedgers.length;
    const totalFees = studentLedgers.reduce((acc, l) => acc + (Number(l.totalFee) || 0), 0);
    const collected = studentLedgers.reduce((acc, l) => acc + (Number(l.paidAmount) || 0), 0);
    const pending = studentLedgers.reduce((acc, l) => acc + (Number(l.pendingAmount) || 0), 0);
    const overdue = studentLedgers
      .filter((l) => l.status === 'OVERDUE')
      .reduce((acc, l) => acc + (Number(l.pendingAmount) || 0), 0);
    const lateFineCollected = feeTransactions
      .filter((t) => (t.feeType || '').toLowerCase().includes('fine') || (t.notes || '').toLowerCase().includes('fine'))
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 75000);

    const paidCount = studentLedgers.filter((l) => l.status === 'PAID').length;
    const partialCount = studentLedgers.filter((l) => l.status === 'PARTIAL').length;
    const pendingCount = studentLedgers.filter((l) => l.status === 'PENDING').length;
    const overdueCount = studentLedgers.filter((l) => l.status === 'OVERDUE').length;

    const paidAmount = studentLedgers.filter((l) => l.status === 'PAID').reduce((acc, l) => acc + (Number(l.paidAmount) || 0), 0);
    const partialAmount = studentLedgers.filter((l) => l.status === 'PARTIAL').reduce((acc, l) => acc + (Number(l.paidAmount) || 0), 0);
    const pendingAmount = studentLedgers.filter((l) => l.status === 'PENDING').reduce((acc, l) => acc + (Number(l.pendingAmount) || 0), 0);
    const overdueAmount = overdue;

    return {
      totalStudents,
      totalFees,
      collected,
      pending,
      overdue,
      lateFineCollected,
      counts: { paid: paidCount, partial: partialCount, pending: pendingCount, overdue: overdueCount },
      amounts: { paid: paidAmount, partial: partialAmount, pending: pendingAmount, overdue: overdueAmount },
      percentages: {
        paid: totalStudents ? Math.round((paidCount / totalStudents) * 100) : 0,
        partial: totalStudents ? Math.round((partialCount / totalStudents) * 100) : 0,
        pending: totalStudents ? Math.round((pendingCount / totalStudents) * 100) : 0,
        overdue: totalStudents ? Math.round((overdueCount / totalStudents) * 100) : 0,
      },
    };
  }, [studentLedgers, feeTransactions]);

  // Class Overview Details for Dashboard
  const classOverviewData = useMemo(() => {
    const classStudents = studentLedgers.filter((s) => s.class === dashboardOverviewClass);
    const count = classStudents.length;
    const paid = classStudents.filter((s) => s.status === 'PAID').length;
    const partial = classStudents.filter((s) => s.status === 'PARTIAL').length;
    const pending = classStudents.filter((s) => s.status === 'PENDING').length;
    const overdue = classStudents.filter((s) => s.status === 'OVERDUE').length;
    const totalFee = classStudents.reduce((acc, s) => acc + (Number(s.totalFee) || 0), 0);
    const collected = classStudents.reduce((acc, s) => acc + (Number(s.paidAmount) || 0), 0);
    const pendingAmt = classStudents.reduce((acc, s) => acc + (Number(s.pendingAmount) || 0), 0);

    return { count, paid, partial, pending, overdue, totalFee, collected, pendingAmt };
  }, [studentLedgers, dashboardOverviewClass]);

  // Payment Recording Form Handler
  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = Number(formData.get('amount'));
    const feeType = formData.get('feeType');
    const paymentMethod = formData.get('paymentMethod');
    const paymentDate = formData.get('paymentDate');
    const notes = formData.get('notes');

    if (!amount || amount <= 0) {
      toastError('Please enter a valid positive payment amount.');
      return;
    }

    if (amount > (paymentModalData.totalOutstanding || paymentModalData.pendingAmount)) {
      const confirmExceed = window.confirm(
        `Entered amount (${formatCurrency(amount)}) is greater than outstanding balance (${formatCurrency(
          paymentModalData.totalOutstanding || paymentModalData.pendingAmount
        )}). Proceed with overpayment?`
      );
      if (!confirmExceed) return;
    }

    const createdTxn = schoolDataService.recordFeePayment({
      studentId: paymentModalData.studentId,
      studentName: paymentModalData.studentName,
      rollNumber: paymentModalData.rollNumber,
      class: paymentModalData.class,
      section: paymentModalData.section,
      academicSession: paymentModalData.academicSession || '2026-27',
      amount,
      feeType,
      paymentMethod,
      paymentDate,
      notes,
      schoolId,
    });

    reloadData();
    setPaymentModalData(null);
    setSelectedReceiptForPrint(createdTxn);
    success(`Payment of ${formatCurrency(amount)} recorded successfully! Receipt: ${createdTxn.receiptNo}`);
  };

  // Late Fine Configuration Form Handler
  const handleSaveFineSettings = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSettings = {
      fineType: formData.get('fineType'),
      fineAmount: Number(formData.get('fineAmount')),
      fixedAmount: Number(formData.get('fixedAmount')),
      gracePeriod: Number(formData.get('gracePeriod')),
    };
    schoolDataService.saveLateFineSettings(newSettings, schoolId);
    reloadData();
    setIsFineSettingsModalOpen(false);
    success('Late fine policy and grace period updated successfully!');
  };

  // Status Badge UI Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
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
            PAID
          </span>
        );
      case 'PARTIAL':
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
            PARTIALLY PAID
          </span>
        );
      case 'PENDING':
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
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#2563eb',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            PENDING
          </span>
        );
      case 'OVERDUE':
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
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            OVERDUE
          </span>
        );
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <DollarSign size={24} />
            </div>
            <div>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>
                School Fee Management System
              </h1>
              <p className="page-subtitle" style={{ margin: 0, fontSize: '0.925rem' }}>
                Class-wise, section-wise fee ledgers, automated late fines, collection receipts & audits
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-outline"
            onClick={reloadData}
            title="Refresh state"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} />
            <span>Sync State</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const defaultStudent = studentLedgers.find((s) => s.status !== 'PAID') || studentLedgers[0];
              setPaymentModalData(defaultStudent);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CreditCard size={16} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs (8 Essential Tabs - Fee Structure Removed) */}
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
          { key: 'dashboard', label: 'Fee Dashboard', icon: Layers },
          { key: 'students', label: 'Student Fees', icon: User },
          { key: 'collection', label: 'Fee Collection', icon: TrendingUp },
          { key: 'pending', label: 'Pending Fees', icon: AlertCircle, badge: metrics.counts.pending + metrics.counts.partial },
          { key: 'overdue', label: 'Overdue Fees', icon: AlertTriangle, badge: metrics.counts.overdue, badgeColor: '#ef4444' },
          { key: 'late-fine', label: 'Late Fine', icon: ShieldAlert, badge: fineMetrics.studentsWithFine, badgeColor: '#8b5cf6' },
          { key: 'history', label: 'Payment History', icon: Receipt },
          { key: 'reports', label: 'Fee Reports', icon: BarChart3 },
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
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 550,
                fontSize: '0.925rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (tab.badgeColor || 'rgba(99,102,241,0.15)'),
                    color: isActive ? '#ffffff' : (tab.badgeColor ? '#ffffff' : 'var(--primary)'),
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. FEE DASHBOARD TAB */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Summary Cards */}
          <div className="grid-4" style={{ gap: '16px' }}>
            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #6366f1' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL STUDENTS</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>{metrics.totalStudents.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Nursery – Class 10 enrolled</div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL ANNUAL FEES</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
                {formatCurrency(metrics.totalFees)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Academic Session 2026-27</div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL COLLECTED</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>
                {formatCurrency(metrics.collected)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
                {metrics.totalFees ? Math.round((metrics.collected / metrics.totalFees) * 100) : 0}% Realized
              </div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL PENDING</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>
                {formatCurrency(metrics.pending)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
                {metrics.counts.pending + metrics.counts.partial} Students with balance
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '16px' }}>
            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>OVERDUE FEES</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#ef4444' }}>
                    {formatCurrency(metrics.overdue)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
                    🔴 {metrics.counts.overdue} Overdue Accounts
                  </div>
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => handleTabChange('overdue')}
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  View Overdue List
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>LATE FINE COLLECTED</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#8b5cf6' }}>
                    {formatCurrency(metrics.lateFineCollected)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 600, marginTop: '4px' }}>
                    Automated grace period & deterministic rules
                  </div>
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => handleTabChange('late-fine')}
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  Manage Late Fines →
                </button>
              </div>
            </div>
          </div>

          {/* Payment Status Cards Overview */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Payment Status Overview</h3>
            <div className="grid-4" style={{ gap: '16px' }}>
              {/* PAID */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  PAID
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                  {metrics.counts.paid} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Students</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  {formatCurrency(metrics.amounts.paid)} ({metrics.percentages.paid}%)
                </div>
              </div>

              {/* PARTIAL */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', fontWeight: 700 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  PARTIALLY PAID
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                  {metrics.counts.partial} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Students</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#d97706', fontWeight: 600, marginTop: '4px' }}>
                  {formatCurrency(metrics.amounts.partial)} ({metrics.percentages.partial}%)
                </div>
              </div>

              {/* PENDING */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 700 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                  PENDING
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                  {metrics.counts.pending} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Students</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>
                  {formatCurrency(metrics.amounts.pending)} ({metrics.percentages.pending}%)
                </div>
              </div>

              {/* OVERDUE */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 700 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  OVERDUE
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                  {metrics.counts.overdue} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Students</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 600, marginTop: '4px' }}>
                  {formatCurrency(metrics.amounts.overdue)} ({metrics.percentages.overdue}%)
                </div>
              </div>
            </div>
          </div>

          {/* Class-wise Fee Overview Selector & Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Class-Wise Fee Overview</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                  Select any class from Nursery to Class 10 to inspect cohort metrics
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Class:</span>
                <select
                  className="form-control"
                  value={dashboardOverviewClass}
                  onChange={(e) => setDashboardOverviewClass(e.target.value)}
                  style={{ width: '160px', padding: '6px 12px' }}
                >
                  {SCHOOL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Class Snapshot */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '10px',
                padding: '18px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                  {dashboardOverviewClass} Fee Snapshot
                </h4>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setSelectedClass(dashboardOverviewClass);
                    handleTabChange('students');
                  }}
                  style={{ fontSize: '0.85rem', padding: '4px 10px' }}
                >
                  View {dashboardOverviewClass} Students →
                </button>
              </div>

              <div className="grid-4" style={{ gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Students</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>{classOverviewData.count}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Paid: {classOverviewData.paid} | Partial: {classOverviewData.partial}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Pending / Overdue</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', color: '#f59e0b' }}>
                    {classOverviewData.pending + classOverviewData.overdue}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                    Overdue: {classOverviewData.overdue} students
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Class Fee</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', color: 'var(--primary)' }}>
                    {formatCurrency(classOverviewData.totalFee)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Collected: {formatCurrency(classOverviewData.collected)}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Outstanding Balance</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', color: '#ef4444' }}>
                    {formatCurrency(classOverviewData.pendingAmt)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Collection: {classOverviewData.totalFee ? Math.round((classOverviewData.collected / classOverviewData.totalFee) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Charts & Trends Breakdown */}
          <div className="grid-2" style={{ gap: '20px' }}>
            {/* Monthly Collection Trend */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Collection Trend (2026)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Apr 2026 – Sep 2026</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { month: 'April 2026', amount: 3200000, target: 3500000, pct: 91 },
                  { month: 'May 2026', amount: 2850000, target: 3000000, pct: 95 },
                  { month: 'June 2026', amount: 1900000, target: 2000000, pct: 95 },
                  { month: 'July 2026', amount: 2100000, target: 2500000, pct: 84 },
                  { month: 'August 2026', amount: 1800000, target: 2000000, pct: 90 },
                  { month: 'September 2026', amount: 1650000, target: 2000000, pct: 82 },
                ].map((item) => (
                  <div key={item.month}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{item.month}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(item.amount)} ({item.pct}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.pct}%`,
                          backgroundColor: 'var(--primary)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Head Breakdown */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Fee Head Category Realization</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>All Categories</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { head: 'Tuition Fee', collected: 5800000, total: 7200000, color: '#6366f1' },
                  { head: 'Admission & Annual Fee', collected: 1850000, total: 2000000, color: '#10b981' },
                  { head: 'Transport Fee', collected: 950000, total: 1300000, color: '#f59e0b' },
                  { head: 'Exam & Lab Fee', collected: 780000, total: 950000, color: '#3b82f6' },
                  { head: 'Library & Activities', collected: 470000, total: 600000, color: '#8b5cf6' },
                ].map((item) => {
                  const pct = Math.round((item.collected / item.total) * 100);
                  return (
                    <div key={item.head}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{item.head}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatCurrency(item.collected)} / {formatCurrency(item.total)} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            backgroundColor: item.color,
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STUDENT FEES TAB (Main Ledger & Filters) */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div
            className="card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Search + Instant Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 250px', position: 'relative' }}>
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
                  placeholder="Search by Student Name, ID, Roll No, Parent Name or Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '38px', height: '40px' }}
                />
              </div>

              {/* Class Filter (Nursery -> Class 10) */}
              <div style={{ width: '160px' }}>
                <select
                  className="form-control"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{ height: '40px' }}
                >
                  <option value="All">All Classes (K-10)</option>
                  {SCHOOL_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div style={{ width: '130px' }}>
                <select
                  className="form-control"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  style={{ height: '40px' }}
                >
                  <option value="All">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ width: '160px' }}>
                <select
                  className="form-control"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ height: '40px' }}
                >
                  <option value="All">All Payment Statuses</option>
                  <option value="PAID">🟢 PAID</option>
                  <option value="PARTIAL">🟡 PARTIALLY PAID</option>
                  <option value="PENDING">🔵 PENDING</option>
                  <option value="OVERDUE">🔴 OVERDUE</option>
                </select>
              </div>

              {/* Reset Filter */}
              {(searchQuery || selectedClass !== 'All' || selectedSection !== 'All' || selectedStatus !== 'All') && (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClass('All');
                    setSelectedSection('All');
                    setSelectedStatus('All');
                  }}
                  style={{ height: '40px', padding: '0 14px' }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Filter Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>
                Showing <strong>{filteredLedgers.length}</strong> of {studentLedgers.length} student ledgers
              </span>
              <span>Academic Session: <strong>{selectedSession}</strong></span>
            </div>
          </div>

          {/* Student Fees Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name & ID</th>
                    <th>Roll No</th>
                    <th>Class & Sec</th>
                    <th style={{ textAlign: 'right' }}>Total Fee</th>
                    <th style={{ textAlign: 'right' }}>Paid</th>
                    <th style={{ textAlign: 'right' }}>Pending</th>
                    <th style={{ textAlign: 'right' }}>Late Fine</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedgers.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.studentName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            ID: {item.studentId} • Parent: {item.parentName} ({item.parentPhone})
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{item.rollNumber}</span>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {item.class} - Sec {item.section}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.totalFee)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{formatCurrency(item.paidAmount)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: item.pendingAmount > 0 ? '#f59e0b' : 'var(--text-tertiary)' }}>
                        {formatCurrency(item.pendingAmount)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: item.fineAmount > 0 ? '#ef4444' : 'var(--text-tertiary)' }}>
                        {item.fineAmount > 0 ? (
                          <span>
                            {formatCurrency(item.fineAmount)}
                            <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>({item.lateDays}d late)</div>
                          </span>
                        ) : (
                          '₹0'
                        )}
                      </td>
                      <td>{renderStatusBadge(item.status)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => setSelectedStudentForView(item)}
                            title="View Fee Profile & Breakdown"
                            style={{ padding: '6px 10px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => setPaymentModalData(item)}
                            title="Record Payment"
                            style={{ padding: '6px 10px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CreditCard size={14} />
                            <span>Pay</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredLedgers.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                        No student fee records found matching your active search/filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FEE COLLECTION TAB */}
      {/* ========================================================================= */}
      {activeTab === 'collection' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Collection Timeframes */}
          <div className="grid-4" style={{ gap: '16px' }}>
            <div className="card" style={{ padding: '18px', borderTop: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TODAY'S COLLECTION</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>
                ₹1,45,000
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>6 Transactions cleared</div>
            </div>

            <div className="card" style={{ padding: '18px', borderTop: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>THIS WEEK'S COLLECTION</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#3b82f6' }}>
                ₹8,20,000
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>42 Transactions</div>
            </div>

            <div className="card" style={{ padding: '18px', borderTop: '4px solid #6366f1' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>THIS MONTH'S COLLECTION</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
                ₹28,50,000
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>95% of monthly quota</div>
            </div>

            <div className="card" style={{ padding: '18px', borderTop: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>ACADEMIC YEAR COLLECTION</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#8b5cf6' }}>
                {formatCurrency(metrics.collected)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Session 2026-27 total</div>
            </div>
          </div>

          {/* Payment Method Channels */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Collection by Payment Methods</h3>
            <div className="grid-4" style={{ gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>UPI / QR Instant</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '6px' }}>₹46,20,000</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>47% Share • 142 txns</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>Bank Transfer (NEFT/RTGS)</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '6px' }}>₹32,10,000</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>33% Share • 84 txns</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>Cash (Admin Counter)</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '6px' }}>₹14,80,000</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>15% Share • 56 txns</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8b5cf6' }}>Cheque Clearance</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '6px' }}>₹5,40,000</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>5% Share • 18 txns</div>
              </div>
            </div>
          </div>

          {/* Quick Recent Collections Feed */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Fee Collections</h3>
              <button className="btn btn-outline" onClick={() => handleTabChange('history')} style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                Full Ledger →
              </button>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Student Name & Class</th>
                    <th>Fee Type</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: 'right' }}>Amount Paid</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feeTransactions.slice(0, 5).map((t) => (
                    <tr key={t.id}>
                      <td><strong style={{ color: 'var(--primary)' }}>{t.receiptNo}</strong></td>
                      <td>{t.paidDate || t.paymentDate}</td>
                      <td>
                        <strong>{t.studentName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Class {t.class} - Sec {t.section}</div>
                      </td>
                      <td>{t.feeType || t.feeHead}</td>
                      <td><span className="badge badge-info">{t.paymentMethod || t.mode}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{formatCurrency(t.amount)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => setSelectedReceiptForPrint(t)}
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                          <Printer size={14} /> Print
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
      {/* 4. PENDING FEES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f59e0b' }}>
                Pending Student Fees
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                Students with unpaid or partially settled fee accounts
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="form-control"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="All">All Classes</option>
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                className="form-control"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                style={{ width: '120px' }}
              >
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name & ID</th>
                    <th>Roll No</th>
                    <th>Class & Sec</th>
                    <th style={{ textAlign: 'right' }}>Total Fee</th>
                    <th style={{ textAlign: 'right' }}>Paid</th>
                    <th style={{ textAlign: 'right' }}>Pending Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentLedgers
                    .filter((s) => s.status === 'PENDING' || s.status === 'PARTIAL')
                    .filter((s) => selectedClass === 'All' || s.class === selectedClass)
                    .filter((s) => selectedSection === 'All' || s.section === selectedSection)
                    .map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.studentName}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>ID: {item.studentId} • Parent: {item.parentPhone}</div>
                        </td>
                        <td>{item.rollNumber}</td>
                        <td><span className="badge badge-primary">{item.class} - Sec {item.section}</span></td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.totalFee)}</td>
                        <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{formatCurrency(item.paidAmount)}</td>
                        <td style={{ textAlign: 'right', color: '#f59e0b', fontWeight: 800 }}>{formatCurrency(item.pendingAmount)}</td>
                        <td>{item.dueDate}</td>
                        <td>{renderStatusBadge(item.status)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => setPaymentModalData(item)}
                            style={{ padding: '6px 12px', fontSize: '0.825rem' }}
                          >
                            Record Payment
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
      {/* 5. OVERDUE FEES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overdue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            className="card"
            style={{
              padding: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#dc2626' }}>
                  Overdue Accounts & Late Fine Audit
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                Accounts where due dates have elapsed. Late fines are calculated deterministically with grace periods.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-danger" style={{ fontSize: '0.875rem', padding: '6px 12px' }}>
                {metrics.counts.overdue} Overdue Accounts ({formatCurrency(metrics.overdue)})
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr style={{ backgroundColor: 'rgba(239, 68, 68, 0.04)' }}>
                    <th>Student Name & ID</th>
                    <th>Class & Sec</th>
                    <th>Due Date</th>
                    <th>Late Days</th>
                    <th style={{ textAlign: 'right' }}>Due Amount</th>
                    <th style={{ textAlign: 'right' }}>Late Fine</th>
                    <th style={{ textAlign: 'right' }}>Total Outstanding</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentLedgers
                    .filter((s) => s.status === 'OVERDUE')
                    .map((item) => (
                      <tr key={item.id} style={{ borderLeft: '4px solid #ef4444' }}>
                        <td>
                          <strong>{item.studentName}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            ID: {item.studentId} • Roll: {item.rollNumber} • Ph: {item.parentPhone}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {item.class} - {item.section}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#dc2626' }}>{item.dueDate}</div>
                        </td>
                        <td>
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>🔴 {item.lateDays} days</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            Grace: {fineSettings.gracePeriod}d
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.pendingAmount)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          +{formatCurrency(item.fineAmount)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626', fontSize: '1.05rem' }}>
                          {formatCurrency(item.totalOutstanding)}
                        </td>
                        <td>{renderStatusBadge('OVERDUE')}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => setPaymentModalData(item)}
                            style={{ padding: '6px 12px', fontSize: '0.825rem' }}
                          >
                            Collect Fee
                          </button>
                        </td>
                      </tr>
                    ))}

                  {studentLedgers.filter((s) => s.status === 'OVERDUE').length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#10b981' }}>
                        ✓ All student fee accounts are currently within due dates or fully settled!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. REDESIGNED LATE FINE SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'late-fine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Late Fine Header */}
          <div
            className="card"
            style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(139, 92, 246, 0.12)',
                    color: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                    Late Fine Management
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Track, review and manage late payment fines for students.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn btn-outline"
                onClick={() => setIsFineSettingsModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}
              >
                <Settings size={15} />
                <span>Fine Policy Rules</span>
              </button>
            </div>
          </div>

          {/* Clean Summary Cards */}
          <div className="grid-4" style={{ gap: '16px' }}>
            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>TOTAL LATE FINES</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#8b5cf6' }}>
                {formatCurrency(fineMetrics.totalLateFines)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Session 2026-27 assessment
              </div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>FINE COLLECTED</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>
                {formatCurrency(fineMetrics.fineCollected)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
                Cleared across all cohorts
              </div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>FINE PENDING</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>
                {formatCurrency(fineMetrics.finePending)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
                Awaiting student clearance
              </div>
            </div>

            <div className="card" style={{ padding: '18px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>STUDENTS WITH FINE</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: '#ef4444' }}>
                {fineMetrics.studentsWithFine}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
                Accounts past grace period
              </div>
            </div>
          </div>

          {/* Clean Filters Bar */}
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
              {/* Student Search */}
              <div style={{ flex: '1 1 250px', position: 'relative' }}>
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
                  placeholder="Search student name, ID, roll no, parent contact..."
                  value={fineSearchQuery}
                  onChange={(e) => setFineSearchQuery(e.target.value)}
                  style={{ paddingLeft: '38px', height: '40px' }}
                />
              </div>

              {/* Class Filter (Nursery to Class 10) */}
              <div style={{ width: '150px' }}>
                <select
                  className="form-control"
                  value={fineClass}
                  onChange={(e) => setFineClass(e.target.value)}
                  style={{ height: '40px' }}
                >
                  <option value="All">All Classes (K-10)</option>
                  {SCHOOL_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div style={{ width: '130px' }}>
                <select
                  className="form-control"
                  value={fineSection}
                  onChange={(e) => setFineSection(e.target.value)}
                  style={{ height: '40px' }}
                >
                  <option value="All">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              {/* Fine Status Filter */}
              <div style={{ width: '160px' }}>
                <select
                  className="form-control"
                  value={fineStatus}
                  onChange={(e) => setFineStatus(e.target.value)}
                  style={{ height: '40px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Overdue">Overdue (Active Fine)</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid / Settled</option>
                </select>
              </div>

              {/* Session Filter */}
              <div style={{ width: '130px' }}>
                <select
                  className="form-control"
                  value={fineSession}
                  onChange={(e) => setFineSession(e.target.value)}
                  style={{ height: '40px' }}
                >
                  <option value="2026-27">2026-27</option>
                  <option value="2025-26">2025-26</option>
                </select>
              </div>

              {/* Reset Filter */}
              {(fineSearchQuery || fineClass !== 'All' || fineSection !== 'All' || fineStatus !== 'All') && (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setFineSearchQuery('');
                    setFineClass('All');
                    setFineSection('All');
                    setFineStatus('All');
                  }}
                  style={{ height: '40px', padding: '0 14px' }}
                >
                  Reset
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>
                Showing <strong>{filteredFineRecords.length}</strong> student late fine accounts
              </span>
              <span>
                Current Policy: <strong>{fineSettings.fineType === 'fixed' ? `₹${fineSettings.fixedAmount || 500} Fixed` : `₹${fineSettings.fineAmount || 50}/day`}</strong> (Grace: {fineSettings.gracePeriod} days)
              </span>
            </div>
          </div>

          {/* Late Fine Student Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Fee Due Date</th>
                    <th>Late Days</th>
                    <th>Fine Type</th>
                    <th style={{ textAlign: 'right' }}>Fine Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFineRecords.map((item) => (
                    <tr key={item.id} style={{ borderLeft: item.fineAmount > 0 ? '4px solid #8b5cf6' : undefined }}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.studentName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            ID: {item.studentId} • Parent: {item.parentName} ({item.parentPhone})
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{item.rollNumber}</span>
                      </td>
                      <td><strong>{item.class}</strong></td>
                      <td><span className="badge badge-primary">Sec {item.section}</span></td>
                      <td>{item.dueDate}</td>
                      <td>
                        {item.lateDays > 0 ? (
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>
                            🔴 {item.lateDays} days
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                              ({item.lateDaysAfterGrace} billable)
                            </div>
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 600 }}>0 days (On-time)</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {item.fineTypeDisplay}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: item.fineAmount > 0 ? '#ef4444' : 'var(--text-tertiary)' }}>
                        {formatCurrency(item.fineAmount)}
                      </td>
                      <td>{renderStatusBadge(item.status)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => setSelectedFineForDetails(item)}
                            title="View Full Fine Assessment & Calculation"
                            style={{ padding: '6px 10px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => setPaymentModalData(item)}
                            title="Record Fine Payment"
                            style={{ padding: '6px 10px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CreditCard size={14} />
                            <span>Collect</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredFineRecords.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                        No late fine records found matching the active filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PAYMENT HISTORY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Fee Payment History & Receipt Ledger</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                Auditable log of all processed student fee payments, receipts and vouchers
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Payment Date</th>
                    <th>Student Name & ID</th>
                    <th>Class - Sec</th>
                    <th>Fee Head / Type</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: 'right' }}>Amount Paid</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feeTransactions.map((t) => (
                    <tr key={t.id}>
                      <td><strong style={{ color: 'var(--primary)' }}>{t.receiptNo}</strong></td>
                      <td>{t.paidDate || t.paymentDate}</td>
                      <td>
                        <strong>{t.studentName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>ID: {t.studentId} • Roll: {t.rollNumber}</div>
                      </td>
                      <td><span className="badge badge-primary">{t.class} - {t.section}</span></td>
                      <td>{t.feeType || t.feeHead}</td>
                      <td><span className="badge badge-info">{t.paymentMethod || t.mode}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{formatCurrency(t.amount)}</td>
                      <td><span className="badge badge-success">Success</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => setSelectedReceiptForPrint(t)}
                          style={{ padding: '6px 10px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto' }}
                        >
                          <Printer size={14} />
                          <span>Receipt</span>
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
      {/* 8. FEE REPORTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Class-wise Collection Report Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Class-Wise Fee Collection Report (K-10)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                  Comprehensive breakdown across Nursery to Class 10
                </p>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Printer size={15} />
                <span>Print Report</span>
              </button>
            </div>

            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th style={{ textAlign: 'center' }}>Enrolled Students</th>
                    <th style={{ textAlign: 'right' }}>Total Fee</th>
                    <th style={{ textAlign: 'right' }}>Collected</th>
                    <th style={{ textAlign: 'right' }}>Pending</th>
                    <th style={{ textAlign: 'right' }}>Overdue</th>
                    <th style={{ textAlign: 'center' }}>Realization %</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHOOL_CLASSES.map((cls) => {
                    const classStudents = studentLedgers.filter((s) => s.class === cls);
                    const count = classStudents.length || 40;
                    const totalFee = classStudents.reduce((acc, s) => acc + (Number(s.totalFee) || 0), 0) || (cls.includes('Nursery') ? 800000 : 900000);
                    const collected = classStudents.reduce((acc, s) => acc + (Number(s.paidAmount) || 0), 0) || (cls.includes('Nursery') ? 700000 : 800000);
                    const pending = classStudents.reduce((acc, s) => acc + (Number(s.pendingAmount) || 0), 0) || 80000;
                    const overdue = classStudents.filter((s) => s.status === 'OVERDUE').reduce((acc, s) => acc + (Number(s.pendingAmount) || 0), 0) || 20000;
                    const pct = Math.round((collected / totalFee) * 100);

                    return (
                      <tr key={cls}>
                        <td><strong>{cls}</strong></td>
                        <td style={{ textAlign: 'center' }}>{count}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(totalFee)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{formatCurrency(collected)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>{formatCurrency(pending)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>{formatCurrency(overdue)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${pct >= 85 ? 'badge-success' : 'badge-warning'}`}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LATE FINE DETAILS & CALCULATION VISUALIZER */}
      {/* ========================================================================= */}
      {selectedFineForDetails && (
        <Modal
          isOpen={!!selectedFineForDetails}
          onClose={() => setSelectedFineForDetails(null)}
          title={`Late Fine Details: ${selectedFineForDetails.studentName}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Student Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {selectedFineForDetails.studentName}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Student ID: <strong>{selectedFineForDetails.studentId}</strong> • Roll No: <strong>{selectedFineForDetails.rollNumber}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Class: <strong>{selectedFineForDetails.class} - Section {selectedFineForDetails.section}</strong> • Parent: <strong>{selectedFineForDetails.parentName}</strong> ({selectedFineForDetails.parentPhone})
                </div>
              </div>
              <div>{renderStatusBadge(selectedFineForDetails.status)}</div>
            </div>

            {/* Fee Details & Late Fine Summary Cards */}
            <div className="grid-2" style={{ gap: '14px' }}>
              {/* Fee Details Card */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  Fee Account Summary
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fee Category:</span>
                  <strong>Tuition & Standard Heads</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Original Fee Amount:</span>
                  <strong>{formatCurrency(selectedFineForDetails.totalFee)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fee Due Date:</span>
                  <strong style={{ color: '#ef4444' }}>{selectedFineForDetails.dueDate}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Paid Amount:</span>
                  <strong style={{ color: '#10b981' }}>{formatCurrency(selectedFineForDetails.paidAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pending Fee Balance:</span>
                  <strong style={{ color: '#f59e0b' }}>{formatCurrency(selectedFineForDetails.pendingAmount)}</strong>
                </div>
              </div>

              {/* Late Fine Details Card */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8b5cf6', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  Late Fine Breakdown
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fine Policy Type:</span>
                  <strong>{fineSettings.fineType === 'fixed' ? 'Fixed Amount' : 'Per Day Rate'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Grace Period:</span>
                  <strong>{fineSettings.gracePeriod} Days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Elapsed Late Days:</span>
                  <strong style={{ color: selectedFineForDetails.lateDays > 0 ? '#ef4444' : '#10b981' }}>
                    {selectedFineForDetails.lateDays} Days
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Billable Days (Late - Grace):</span>
                  <strong>{selectedFineForDetails.lateDaysAfterGrace || 0} Days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Applied Fine Rate:</span>
                  <strong>{fineSettings.fineType === 'fixed' ? formatCurrency(fineSettings.fixedAmount || 500) : `${formatCurrency(fineSettings.fineAmount || 50)} / day`}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingTop: '4px', borderTop: '1px dashed var(--border-color)' }}>
                  <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Total Fine Outstanding:</span>
                  <strong style={{ color: '#8b5cf6', fontSize: '1rem' }}>{formatCurrency(selectedFineForDetails.fineAmount)}</strong>
                </div>
              </div>
            </div>

            {/* Late Fine Calculation Progression Pipeline */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0' }}>
                Deterministic Calculation Flow
              </h4>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '0.825rem',
                }}
              >
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.725rem' }}>Fee Amount</div>
                  <strong>{formatCurrency(selectedFineForDetails.totalFee)}</strong>
                </div>

                <ArrowRight size={14} color="var(--text-tertiary)" />

                <div style={{ padding: '8px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.725rem' }}>Due Date</div>
                  <strong>{selectedFineForDetails.dueDate}</strong>
                </div>

                <ArrowRight size={14} color="var(--text-tertiary)" />

                <div style={{ padding: '8px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.725rem' }}>Grace Period</div>
                  <strong>{fineSettings.gracePeriod} Days</strong>
                </div>

                <ArrowRight size={14} color="var(--text-tertiary)" />

                <div style={{ padding: '8px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.725rem' }}>Late Days</div>
                  <strong style={{ color: '#ef4444' }}>{selectedFineForDetails.lateDays}d</strong>
                </div>

                <ArrowRight size={14} color="var(--text-tertiary)" />

                <div style={{ padding: '8px 12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <div style={{ color: '#8b5cf6', fontSize: '0.725rem', fontWeight: 600 }}>Fine Applied</div>
                  <strong style={{ color: '#8b5cf6' }}>{formatCurrency(selectedFineForDetails.fineAmount)}</strong>
                </div>

                <ArrowRight size={14} color="var(--text-tertiary)" />

                <div style={{ padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ color: '#dc2626', fontSize: '0.725rem', fontWeight: 600 }}>Total Outstanding</div>
                  <strong style={{ color: '#dc2626' }}>{formatCurrency(selectedFineForDetails.totalOutstanding || selectedFineForDetails.pendingAmount)}</strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedFineForDetails(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const student = selectedFineForDetails;
                  setSelectedFineForDetails(null);
                  setPaymentModalData(student);
                }}
              >
                <CreditCard size={16} />
                <span>Record Fine / Fee Payment</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FINE POLICY RULES CONFIGURATION */}
      {/* ========================================================================= */}
      {isFineSettingsModalOpen && (
        <Modal
          isOpen={isFineSettingsModalOpen}
          onClose={() => setIsFineSettingsModalOpen(false)}
          title="Late Fine Policy Configuration"
        >
          <form onSubmit={handleSaveFineSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Configure grace periods and automated late fee penalty rates. Fines calculate deterministically without duplicate increments.
            </p>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Fine Calculation Type</label>
              <select name="fineType" className="form-control" defaultValue={fineSettings.fineType || 'per_day'}>
                <option value="per_day">Per Day Rate (e.g. ₹50 / day late)</option>
                <option value="fixed">Fixed Penalty Flat Fee (e.g. ₹500)</option>
              </select>
            </div>

            <div className="grid-2" style={{ gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Per-Day Rate (₹/day)</label>
                <input
                  type="number"
                  name="fineAmount"
                  className="form-control"
                  defaultValue={fineSettings.fineAmount || 50}
                  min="0"
                />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Fixed Fine Amount (₹)</label>
                <input
                  type="number"
                  name="fixedAmount"
                  className="form-control"
                  defaultValue={fineSettings.fixedAmount || 500}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Grace Period (in Days)</label>
              <input
                type="number"
                name="gracePeriod"
                className="form-control"
                defaultValue={fineSettings.gracePeriod || 5}
                min="0"
              />
              <div style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Payments made within grace period incur ₹0 late fine.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsFineSettingsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Apply Policy
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STUDENT FEE DETAILS & PROFILE BREAKDOWN */}
      {/* ========================================================================= */}
      {selectedStudentForView && (
        <Modal
          isOpen={!!selectedStudentForView}
          onClose={() => setSelectedStudentForView(null)}
          title={`Student Fee Profile: ${selectedStudentForView.studentName}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Student Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '10px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{selectedStudentForView.studentName}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Student ID: <strong>{selectedStudentForView.studentId}</strong> • Roll No: <strong>{selectedStudentForView.rollNumber}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Class: <strong>{selectedStudentForView.class} - Section {selectedStudentForView.section}</strong> • Session: {selectedStudentForView.academicSession}
                </div>
              </div>
              <div>{renderStatusBadge(selectedStudentForView.status)}</div>
            </div>

            {/* Overdue Warning Alert if applicable */}
            {selectedStudentForView.status === 'OVERDUE' && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={18} />
                <span>🔴 Payment overdue by {selectedStudentForView.lateDays} days (Due Date: {selectedStudentForView.dueDate})</span>
              </div>
            )}

            {/* Fee Summary Cards */}
            <div className="grid-3" style={{ gap: '10px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Annual Fee</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>{formatCurrency(selectedStudentForView.totalFee)}</div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Paid</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px', color: '#10b981' }}>
                  {formatCurrency(selectedStudentForView.paidAmount)}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Outstanding</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px', color: '#ef4444' }}>
                  {formatCurrency(selectedStudentForView.totalOutstanding || selectedStudentForView.pendingAmount)}
                </div>
                {selectedStudentForView.fineAmount > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>
                    (Includes {formatCurrency(selectedStudentForView.fineAmount)} Late Fine)
                  </div>
                )}
              </div>
            </div>

            {/* Fee Breakdown Table */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>Fee Head Breakdown</h4>
              <table className="custom-table" style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th>Fee Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Paid</th>
                    <th style={{ textAlign: 'right' }}>Pending</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedStudentForView.breakdown || []).map((b, idx) => (
                    <tr key={idx}>
                      <td><strong>{b.type}</strong></td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(b.amount)}</td>
                      <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{formatCurrency(b.paid)}</td>
                      <td style={{ textAlign: 'right', color: b.pending > 0 ? '#f59e0b' : 'var(--text-tertiary)' }}>
                        {formatCurrency(b.pending)}
                      </td>
                      <td>
                        <span className={`badge ${b.status === 'Paid' ? 'badge-success' : b.status === 'Partial' ? 'badge-warning' : 'badge-info'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedStudentForView(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const student = selectedStudentForView;
                  setSelectedStudentForView(null);
                  setPaymentModalData(student);
                }}
              >
                <CreditCard size={16} />
                <span>Record Payment</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD PAYMENT */}
      {/* ========================================================================= */}
      {paymentModalData && (
        <Modal
          isOpen={!!paymentModalData}
          onClose={() => setPaymentModalData(null)}
          title={`Record Fee Payment: ${paymentModalData.studentName}`}
        >
          <form onSubmit={handleRecordPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>{paymentModalData.studentName}</strong> (ID: {paymentModalData.studentId})
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  Class: {paymentModalData.class} - Sec {paymentModalData.section}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Pending Amount</div>
                <strong style={{ color: '#ef4444', fontSize: '1.1rem' }}>
                  {formatCurrency(paymentModalData.totalOutstanding || paymentModalData.pendingAmount)}
                </strong>
              </div>
            </div>

            <div>
              <label className="form-label">Fee Head / Category</label>
              <select name="feeType" className="form-control" defaultValue="Tuition Fee">
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Admission Fee">Admission Fee</option>
                <option value="Examination Fee">Examination Fee</option>
                <option value="Library Fee">Library Fee</option>
                <option value="Transport Fee">Transport Fee</option>
                <option value="Activity Fee">Activity Fee</option>
                <option value="Computer/Lab Fee">Computer/Lab Fee</option>
                <option value="Annual Fee">Annual Fee</option>
                <option value="Late Fine Clearance">Late Fine Clearance</option>
                <option value="Miscellaneous Fee">Miscellaneous Fee</option>
              </select>
            </div>

            <div className="grid-2" style={{ gap: '12px' }}>
              <div>
                <label className="form-label">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  defaultValue={paymentModalData.pendingAmount || 10000}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="form-label">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  className="form-control"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Payment Method</label>
              <select name="paymentMethod" className="form-control" defaultValue="UPI">
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash (Counter)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="form-label">Notes / Transaction Reference</label>
              <input
                type="text"
                name="notes"
                className="form-control"
                placeholder="e.g. Bank Ref / Cheque No. 492019"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setPaymentModalData(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Record & Generate Receipt
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE RECEIPT VOUCHER */}
      {/* ========================================================================= */}
      {selectedReceiptForPrint && (
        <Modal
          isOpen={!!selectedReceiptForPrint}
          onClose={() => setSelectedReceiptForPrint(null)}
          title="Payment Receipt Voucher"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Printable Receipt Paper Container */}
            <div
              id="printable-fee-receipt"
              style={{
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      backgroundColor: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                    }}
                  >
                    🏫
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                      {selectedSchool?.name || 'Greenwood International School'}
                    </h2>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Official Fee Payment Receipt Voucher
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Receipt No</div>
                  <strong style={{ color: '#6366f1', fontSize: '1.15rem' }}>{selectedReceiptForPrint.receiptNo}</strong>
                </div>
              </div>

              {/* Student & Payment Metadata */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  fontSize: '0.875rem',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <span style={{ color: '#64748b' }}>Student Name:</span>{' '}
                  <strong>{selectedReceiptForPrint.studentName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Student ID:</span>{' '}
                  <strong>{selectedReceiptForPrint.studentId}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Class & Section:</span>{' '}
                  <strong>{selectedReceiptForPrint.class} - Section {selectedReceiptForPrint.section}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Payment Date:</span>{' '}
                  <strong>{selectedReceiptForPrint.paidDate || selectedReceiptForPrint.paymentDate}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Payment Mode:</span>{' '}
                  <strong>{selectedReceiptForPrint.paymentMethod || selectedReceiptForPrint.mode}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Status:</span>{' '}
                  <strong style={{ color: '#10b981' }}>Cleared (Success)</strong>
                </div>
              </div>

              {/* Fee Breakdown Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '8px 4px' }}>Description / Fee Category</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 4px' }}>
                      <strong>{selectedReceiptForPrint.feeType || selectedReceiptForPrint.feeHead || 'Tuition Fee Payment'}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedReceiptForPrint.notes}</div>
                    </td>
                    <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                      {formatCurrency(selectedReceiptForPrint.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Footer Stamp & Sign */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  paddingTop: '20px',
                  borderTop: '1px dashed #cbd5e1',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  * This is a computer generated receipt. Valid without physical signature.
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '30px', borderBottom: '1px solid #94a3b8', width: '140px' }} />
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Authorized Cashier</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedReceiptForPrint(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.print();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
