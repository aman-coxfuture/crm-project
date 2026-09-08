import { schoolDataService } from './schoolDataService';

const CURRENT_USER_KEY = 'school_crm_current_user';
const SELECTED_SCHOOL_KEY = 'school_crm_selected_school';

export const mockUsers = {
  superAdmin: {
    id: 'USR-SA-01',
    name: 'Chief Platform Director',
    email: 'superadmin@schoolcrm.io',
    role: 'super-admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schoolId: null,
  },
  principal: {
    id: 'USR-PR-01',
    name: 'Dr. Robert Harrison',
    email: 'principal@greenwood.edu',
    role: 'school-admin',
    title: 'Principal & Head of School',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    schoolId: 'SCH-001',
  },
  teacher: {
    id: 'TCH-001',
    name: 'Sarah Jenkins',
    email: 'teacher@example.com',
    role: 'teacher',
    subject: 'Mathematics',
    department: 'Science & Math',
    classes: ['10-A', '10-B', '11-Science'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    schoolId: 'SCH-001',
  },
  student: {
    id: 'STU001',
    name: 'Alex Johnson',
    rollNumber: 'STU001',
    email: 'student@example.com',
    role: 'student',
    class: '10',
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

    if (role === 'student') {
      const students = schoolDataService.getStudents();
      const matched = students.find(
        (s) =>
          s.email.toLowerCase() === (email || '').toLowerCase() ||
          s.rollNumber.toUpperCase() === (rollNumber || '').toUpperCase()
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
        schoolId: 'SCH-001',
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
      return userObj;
    }

    if (role === 'super-admin') {
      const userObj = { ...mockUsers.superAdmin, email: email || mockUsers.superAdmin.email };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
      return userObj;
    }

    if (role === 'teacher') {
      const teachers = schoolDataService.getTeachers();
      const matched = teachers.find((t) => t.email.toLowerCase() === (email || '').toLowerCase()) || mockUsers.teacher;
      const userObj = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: 'teacher',
        subject: matched.subject,
        department: matched.department,
        classes: matched.classes || ['10-A'],
        avatar: matched.avatar || mockUsers.teacher.avatar,
        schoolId: 'SCH-001',
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
      return userObj;
    }

    // Default Principal / School Admin
    const userObj = { ...mockUsers.principal, email: email || mockUsers.principal.email };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
    return userObj;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};
