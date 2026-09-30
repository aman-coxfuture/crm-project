// Mock Staff Salary & Leave Management Dataset & Dynamic Calculation Utilities

export const SALARY_MONTHS = [
  'September 2026',
  'August 2026',
  'July 2026',
  'June 2026',
  'May 2026',
  'April 2026',
];

export const initialStaffSalaryRecords = {
  'September 2026': [
    // --- Teachers ---
    {
      id: 'TCH-001',
      name: 'Rahul Sharma',
      type: 'Teacher',
      designation: 'Mathematics Teacher',
      department: 'Mathematics & Computing',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      email: 'rahul@example.com',
      phone: '+1 (555) 789-0123',
      monthlySalary: 30000,
      totalWorkingDays: 30,
      paidLeave: 0,
      unpaidLeave: 10,
      salaryStatus: 'Pending',
    },
    {
      id: 'TCH-002',
      name: 'Priya Singh',
      type: 'Teacher',
      designation: 'English Literature Teacher',
      department: 'Languages & Arts',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: 'priya.singh@example.com',
      phone: '+1 (555) 890-1234',
      monthlySalary: 32000,
      totalWorkingDays: 30,
      paidLeave: 2,
      unpaidLeave: 2,
      salaryStatus: 'Pending',
    },
    {
      id: 'TCH-003',
      name: 'Amit Kumar',
      type: 'Teacher',
      designation: 'Science Teacher',
      department: 'Science',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      email: 'amit.kumar@example.com',
      phone: '+1 (555) 901-2345',
      monthlySalary: 30000,
      totalWorkingDays: 30,
      paidLeave: 5,
      unpaidLeave: 3,
      salaryStatus: 'Pending',
    },
    {
      id: 'TCH-004',
      name: 'Neha Sharma',
      type: 'Teacher',
      designation: 'Hindi & Sanskrit Teacher',
      department: 'Languages & Arts',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      email: 'neha.sharma@example.com',
      phone: '+1 (555) 012-3456',
      monthlySalary: 34000,
      totalWorkingDays: 30,
      paidLeave: 3,
      unpaidLeave: 0,
      salaryStatus: 'Paid',
    },
    {
      id: 'TCH-005',
      name: 'Sarah Jenkins',
      type: 'Teacher',
      designation: 'Senior Math Faculty',
      department: 'Mathematics & Computing',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 123-4567',
      monthlySalary: 45000,
      totalWorkingDays: 30,
      paidLeave: 2,
      unpaidLeave: 0,
      salaryStatus: 'Paid',
    },
    {
      id: 'TCH-006',
      name: 'Coach Roy',
      type: 'Teacher',
      designation: 'Physical Education Coach',
      department: 'Sports & Wellness',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      email: 'sports@example.com',
      phone: '+1 (555) 234-5678',
      monthlySalary: 28000,
      totalWorkingDays: 30,
      paidLeave: 1,
      unpaidLeave: 3,
      salaryStatus: 'Pending',
    },

    // --- Drivers ---
    {
      id: 'DRV-001',
      name: 'Ravi Kumar',
      type: 'Driver',
      designation: 'School Bus Driver (Route 1)',
      department: 'Transport',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      email: 'ravi.k@example.com',
      phone: '+1 (555) 901-4433',
      monthlySalary: 25000,
      totalWorkingDays: 30,
      paidLeave: 1,
      unpaidLeave: 4,
      salaryStatus: 'Pending',
    },
    {
      id: 'DRV-002',
      name: 'James Sullivan',
      type: 'Driver',
      designation: 'Medium Bus Driver (Route 2)',
      department: 'Transport',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      email: 'james.s@example.com',
      phone: '+1 (555) 902-5544',
      monthlySalary: 24000,
      totalWorkingDays: 30,
      paidLeave: 2,
      unpaidLeave: 1,
      salaryStatus: 'Paid',
    },
    {
      id: 'DRV-003',
      name: 'Carlos Gomez',
      type: 'Driver',
      designation: 'Mini Van Driver (Route 3)',
      department: 'Transport',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      email: 'carlos.g@example.com',
      phone: '+1 (555) 903-6655',
      monthlySalary: 22000,
      totalWorkingDays: 30,
      paidLeave: 0,
      unpaidLeave: 5,
      salaryStatus: 'Pending',
    },

    // --- Other Staff ---
    {
      id: 'STF-101',
      name: 'Arthur Pendelton',
      type: 'Staff',
      designation: 'Senior Accountant',
      department: 'Finance & Accounts',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      email: 'arthur.p@example.com',
      phone: '+1 (555) 345-6789',
      monthlySalary: 36000,
      totalWorkingDays: 30,
      paidLeave: 2,
      unpaidLeave: 0,
      salaryStatus: 'Paid',
    },
    {
      id: 'STF-102',
      name: 'Grace Holloway',
      type: 'Staff',
      designation: 'Head Receptionist',
      department: 'Front Office',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      email: 'grace.h@example.com',
      phone: '+1 (555) 456-7890',
      monthlySalary: 26000,
      totalWorkingDays: 30,
      paidLeave: 1,
      unpaidLeave: 2,
      salaryStatus: 'Pending',
    },
    {
      id: 'STF-103',
      name: 'Walter Sterling',
      type: 'Staff',
      designation: 'Chief Librarian',
      department: 'Library',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      email: 'walter.s@example.com',
      phone: '+1 (555) 567-8901',
      monthlySalary: 30000,
      totalWorkingDays: 30,
      paidLeave: 2,
      unpaidLeave: 1,
      salaryStatus: 'Paid',
    },
    {
      id: 'STF-104',
      name: 'Rajesh Nair',
      type: 'Staff',
      designation: 'Senior Lab Assistant',
      department: 'Laboratories',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      email: 'rajesh.n@example.com',
      phone: '+1 (555) 678-9012',
      monthlySalary: 24000,
      totalWorkingDays: 30,
      paidLeave: 1,
      unpaidLeave: 3,
      salaryStatus: 'Pending',
    },
    {
      id: 'STF-105',
      name: 'Sunita Verma',
      type: 'Staff',
      designation: 'Office Staff Executive',
      department: 'Administration',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: 'sunita.v@example.com',
      phone: '+1 (555) 789-9988',
      monthlySalary: 20000,
      totalWorkingDays: 30,
      paidLeave: 0,
      unpaidLeave: 2,
      salaryStatus: 'Paid',
    },
  ],
  'August 2026': [
    {
      id: 'TCH-001',
      name: 'Rahul Sharma',
      type: 'Teacher',
      designation: 'Mathematics Teacher',
      department: 'Mathematics & Computing',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      email: 'rahul@example.com',
      phone: '+1 (555) 789-0123',
      monthlySalary: 30000,
      totalWorkingDays: 31,
      paidLeave: 2,
      unpaidLeave: 0,
      salaryStatus: 'Paid',
    },
    {
      id: 'TCH-002',
      name: 'Priya Singh',
      type: 'Teacher',
      designation: 'English Literature Teacher',
      department: 'Languages & Arts',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: 'priya.singh@example.com',
      phone: '+1 (555) 890-1234',
      monthlySalary: 32000,
      totalWorkingDays: 31,
      paidLeave: 1,
      unpaidLeave: 1,
      salaryStatus: 'Paid',
    },
    {
      id: 'TCH-003',
      name: 'Amit Kumar',
      type: 'Teacher',
      designation: 'Science Teacher',
      department: 'Science',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      email: 'amit.kumar@example.com',
      phone: '+1 (555) 901-2345',
      monthlySalary: 30000,
      totalWorkingDays: 31,
      paidLeave: 2,
      unpaidLeave: 2,
      salaryStatus: 'Paid',
    },
    {
      id: 'DRV-001',
      name: 'Ravi Kumar',
      type: 'Driver',
      designation: 'School Bus Driver (Route 1)',
      department: 'Transport',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      email: 'ravi.k@example.com',
      phone: '+1 (555) 901-4433',
      monthlySalary: 25000,
      totalWorkingDays: 31,
      paidLeave: 1,
      unpaidLeave: 2,
      salaryStatus: 'Paid',
    },
    {
      id: 'STF-101',
      name: 'Arthur Pendelton',
      type: 'Staff',
      designation: 'Senior Accountant',
      department: 'Finance & Accounts',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      email: 'arthur.p@example.com',
      phone: '+1 (555) 345-6789',
      monthlySalary: 36000,
      totalWorkingDays: 31,
      paidLeave: 2,
      unpaidLeave: 0,
      salaryStatus: 'Paid',
    },
  ],
};

/**
 * Dynamic Calculation Function
 * Calculates perDaySalary, leaveDeduction, and netSalary dynamically without hardcoding.
 */
export function calculateStaffSalary(staff) {
  const monthlySalary = Number(staff.monthlySalary) || 0;
  const totalWorkingDays = Number(staff.totalWorkingDays) > 0 ? Number(staff.totalWorkingDays) : 30;
  const unpaidLeave = Number(staff.unpaidLeave) || 0;
  const paidLeave = Number(staff.paidLeave) || 0;
  const totalLeave = unpaidLeave + paidLeave;

  // perDaySalary = monthlySalary / totalWorkingDays
  const perDaySalaryExact = monthlySalary / totalWorkingDays;
  const perDaySalary = Math.round(perDaySalaryExact);

  // leaveDeduction = unpaidLeave * perDaySalary
  const leaveDeduction = Math.round(unpaidLeave * perDaySalaryExact);

  // netSalary = monthlySalary - leaveDeduction
  const netSalary = Math.max(0, monthlySalary - leaveDeduction);

  return {
    ...staff,
    monthlySalary,
    totalWorkingDays,
    paidLeave,
    unpaidLeave,
    totalLeave,
    perDaySalary,
    perDaySalaryExact,
    leaveDeduction,
    netSalary,
  };
}

/**
 * Format Currency into clean Indian Rupee notation (e.g., ₹30,000, ₹21,667)
 */
export function formatSalaryCurrency(val) {
  return `₹${Math.round(Number(val) || 0).toLocaleString('en-IN')}`;
}

const STORAGE_KEY = 'crm_staff_salary_records_v1';

export const staffSalaryService = {
  getMonths: () => SALARY_MONTHS,

  getRecordsForMonth: (month = 'September 2026') => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let data = stored ? JSON.parse(stored) : initialStaffSalaryRecords;

      if (!data[month]) {
        // Generate from base September data with default full attendance if month not found
        const base = data['September 2026'] || initialStaffSalaryRecords['September 2026'];
        data[month] = base.map((s) => ({
          ...s,
          unpaidLeave: 0,
          paidLeave: 1,
          salaryStatus: 'Paid',
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }

      return data[month].map(calculateStaffSalary);
    } catch (e) {
      console.error('Error fetching staff salary records:', e);
      return (initialStaffSalaryRecords[month] || initialStaffSalaryRecords['September 2026']).map(calculateStaffSalary);
    }
  },

  updateStaffRecord: (month, staffId, updates) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let data = stored ? JSON.parse(stored) : initialStaffSalaryRecords;

      if (!data[month]) {
        data[month] = (initialStaffSalaryRecords[month] || initialStaffSalaryRecords['September 2026']).map((s) => ({ ...s }));
      }

      data[month] = data[month].map((item) => {
        if (item.id === staffId) {
          return { ...item, ...updates };
        }
        return item;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data[month].map(calculateStaffSalary);
    } catch (e) {
      console.error('Error updating staff salary record:', e);
      return [];
    }
  },

  addStaffMember: (newStaff) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let data = stored ? JSON.parse(stored) : initialStaffSalaryRecords;

      const newId = newStaff.id || `STF-${Date.now().toString().slice(-4)}`;
      const memberRecord = {
        id: newId,
        name: newStaff.name,
        type: newStaff.type || (newStaff.department === 'Transport' ? 'Driver' : 'Staff'),
        designation: newStaff.designation || 'Staff Member',
        department: newStaff.department || 'Administration',
        avatar: newStaff.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        email: newStaff.email || `${newStaff.name.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
        phone: newStaff.phone || '+1 (555) 000-0000',
        monthlySalary: Number(newStaff.monthlySalary) || 25000,
        totalWorkingDays: 30,
        paidLeave: 0,
        unpaidLeave: 0,
        salaryStatus: 'Pending',
      };

      SALARY_MONTHS.forEach((m) => {
        if (!data[m]) data[m] = [];
        data[m] = [memberRecord, ...data[m]];
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return calculateStaffSalary(memberRecord);
    } catch (e) {
      console.error('Error adding staff member:', e);
      return null;
    }
  },
};
