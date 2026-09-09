import { schoolDataService } from './schoolDataService';

const CURRENT_USER_KEY = 'school_crm_current_user';
const SELECTED_SCHOOL_KEY = 'school_crm_selected_school';

export const mockUsers = {
  superAdmin: {
    id: 'USR-SA-01',
    name: 'Super Admin',
    email: 'admin@crm.com',
    role: 'super-admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schoolId: null,
  },
  principal: {
    id: 'USR-PR-01',
    name: 'Dr. Robert Harrison',
    email: 'principal@school.com',
    role: 'school-admin',
    title: 'Principal & Head of School',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    schoolId: 'SCH-001',
  },
  teacher: {
    id: 'TCH-001',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'teacher',
    subject: 'Mathematics',
    department: 'Mathematics & Computing',
    classes: ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9'],
    assignedSubjects: ['Mathematics', 'Computer'],
    experience: '7 Years',
    qualification: 'M.Sc. Mathematics, B.Ed',
    joiningDate: '2019-08-01',
    phone: '+1 (555) 789-0123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schoolId: 'SCH-001',
  },
  student: {
    id: 'STU001',
    name: 'Alex Johnson',
    rollNumber: 'STU001',
    email: 'student@example.com',
    role: 'student',
    class: 'Class 10',
    section: 'A',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    schoolId: 'SCH-001',
  },
};

export const authService = {
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem(CURRENT_USER_KEY);
      return user ? JSON.parse(user) : mockUsers.principal;
    } catch {
      return mockUsers.principal;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(CURRENT_USER_KEY);
  },

  getSelectedSchool: () => {
    try {
      const school = localStorage.getItem(SELECTED_SCHOOL_KEY);
      if (school) return JSON.parse(school);
    } catch {}
    const schools = schoolDataService.getSchools();
    return schools[0] || null;
  },

  setSelectedSchool: (school) => {
    localStorage.setItem(SELECTED_SCHOOL_KEY, JSON.stringify(school));
  },

  login: async (credentials) => {
    // credentials: { role, email, password, rollNumber }
    const { role, email, rollNumber } = credentials;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (role === 'student' || cleanEmail.includes('student') || rollNumber) {
      const students = schoolDataService.getStudents();
      const matched = students.find(
        (s) =>
          (cleanEmail && s.email.toLowerCase() === cleanEmail) ||
          (rollNumber && s.rollNumber.toUpperCase() === rollNumber.toUpperCase())
      ) || mockUsers.student;

      const userObj = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        rollNumber: matched.rollNumber,
        role: 'student',
        class: matched.class,
        section: matched.section,
        avatar: matched.profilePhoto || mockUsers.student.avatar,
        schoolId: matched.schoolId || 'SCH-001',
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
      const school = schoolDataService.getSchoolById(userObj.schoolId);
      if (school) authService.setSelectedSchool(school);
      return userObj;
    }

    if (role === 'super-admin' || cleanEmail.includes('admin@crm.com') || cleanEmail.includes('superadmin')) {
      const userObj = { ...mockUsers.superAdmin, email: email || mockUsers.superAdmin.email };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
      return userObj;
    }

    if (role === 'teacher' || cleanEmail.includes('rahul') || cleanEmail.includes('teacher') || cleanEmail.includes('priya')) {
      const teachers = schoolDataService.getTeachers();
      const matched = teachers.find((t) => t.email.toLowerCase() === cleanEmail) || mockUsers.teacher;
      const userObj = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: 'teacher',
        subject: matched.subject,
        department: matched.department,
        classes: matched.classes || ['Class 5'],
        assignedSubjects: matched.assignedSubjects || [matched.subject],
        experience: matched.experience || '7 Years',
        qualification: matched.qualification || 'M.Sc. Mathematics, B.Ed',
        joiningDate: matched.joiningDate || '2019-08-01',
        phone: matched.phone || '+1 (555) 789-0123',
        avatar: matched.avatar || mockUsers.teacher.avatar,
        schoolId: matched.schoolId || 'SCH-001',
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
      const school = schoolDataService.getSchoolById(userObj.schoolId);
      if (school) authService.setSelectedSchool(school);
      return userObj;
    }

    // Default Principal / School Admin
    const schools = schoolDataService.getSchools();
    let userSchoolId = 'SCH-001';
    if (cleanEmail.includes('stxavier')) userSchoolId = 'SCH-002';
    if (cleanEmail.includes('oakridge')) userSchoolId = 'SCH-003';

    const userSchool = schools.find((s) => s.id === userSchoolId) || schools[0];
    const userObj = {
      ...mockUsers.principal,
      name: userSchool?.principal || mockUsers.principal.name,
      email: email || userSchool?.email || mockUsers.principal.email,
      schoolId: userSchool?.id || 'SCH-001',
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
    if (userSchool) authService.setSelectedSchool(userSchool);
    return userObj;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};
