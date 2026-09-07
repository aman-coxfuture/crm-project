export const mockSuperAdminStats = {
  totalInstitutions: 8,
  totalSchools: 3,
  totalColleges: 3,
  totalUniversities: 2,
  totalStudents: 46790,
  totalFaculty: 2388,
  activeInstitutions: 6,
  pendingInstitutions: 1,
  inactiveInstitutions: 1,
};

export const mockSuperAdminGrowthData = [
  { month: 'Jan', schools: 18, colleges: 12, universities: 4 },
  { month: 'Feb', schools: 22, colleges: 14, universities: 5 },
  { month: 'Mar', schools: 25, colleges: 18, universities: 6 },
  { month: 'Apr', schools: 30, colleges: 22, universities: 7 },
  { month: 'May', schools: 38, colleges: 27, universities: 9 },
  { month: 'Jun', schools: 44, colleges: 32, universities: 12 },
];

export const mockSuperAdminRecentActivities = [
  { id: 'act-1', text: 'New institution "Modern Vidya Mandir" registered for verification', time: '12 mins ago', type: 'registration' },
  { id: 'act-2', text: 'Apex Central University upgraded license to Ultra Enterprise (20k students)', time: '1 hour ago', type: 'upgrade' },
  { id: 'act-3', text: 'St. Xavier\'s Model School generated Term 1 Consolidated Examination Report', time: '3 hours ago', type: 'report' },
  { id: 'act-4', text: 'System backup completed across all database shards successfully', time: '6 hours ago', type: 'system' },
  { id: 'act-5', text: 'Deactivated "Greenfield Institute of Management" due to subscription lapse', time: '1 day ago', type: 'security' },
];

export const mockSchoolStats = {
  totalStudents: 2450,
  totalTeachers: 128,
  totalClasses: 36,
  todayAttendance: '94.6%',
  pendingFees: '₹ 14,80,000',
  upcomingExams: 3,
};

export const mockSchoolProfile = {
  name: 'Delhi Public International School',
  code: 'DPIS-DEL',
  board: 'CBSE Affiliated (Affiliation No: 2130842)',
  address: 'Sector 14, Rohini, New Delhi - 110085',
  principal: 'Dr. Rajesh Sharma, Ph.D. (Ed.)',
  phone: '+91 11 2786 1234',
  email: 'principal@dpis-delhi.edu.in',
  academicYear: '2026-2027',
};

export const mockCollegeStats = {
  totalStudents: 3600,
  totalFaculty: 210,
  totalDepartments: 8,
  totalCourses: 14,
  todayAttendance: '92.4%',
  pendingFees: '₹ 48,50,000',
  activeAdmissions: 420,
};

export const mockCollegeProfile = {
  name: 'Heritage Valley College of Engineering & Technology',
  code: 'HVC-BLR',
  affiliation: 'Autonomous Institute affiliated to VTU, Approved by AICTE, NAAC A++',
  campus: 'Outer Ring Road, Marathahalli, Bengaluru, Karnataka - 560037',
  principal: 'Prof. Sunita Rao, Ph.D. (IISc)',
  phone: '+91 80 2845 8899',
  email: 'dean@heritagevalley.ac.in',
  academicYear: '2026-2027 Odd Semester',
};

export const mockUniversityStats = {
  totalStudents: 18500,
  totalFaculty: 920,
  totalColleges: 32,
  totalDepartments: 24,
  totalPrograms: 48,
  totalCourses: 310,
  activeResearchProjects: 42,
  totalGrants: '₹ 38.4 Cr',
  pendingAdmissions: 1240,
  pendingFees: '₹ 1.24 Cr',
  todayAttendance: '91.8%',
};

export const mockUniversityProfile = {
  name: 'Apex Central University of Science & Technology',
  code: 'ACUST-HYD',
  type: 'Central University (Accredited NAAC A+++, NIRF Top 15)',
  campus: 'University Hills, Gachibowli, Hyderabad, Telangana - 500032',
  viceChancellor: 'Prof. Dr. K. Ramanathan, FNA, FASc',
  registrar: 'Dr. G. Subrahmanyam',
  phone: '+91 40 2313 0000',
  email: 'vc@apex-university.ac.in',
  academicYear: '2026-2027 Academic Session',
};
