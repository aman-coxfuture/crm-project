import { schoolDataService } from './schoolDataService.js';
import { mockUsers, mockUsersList } from '../mock/mockUsers.js';
import { normalizeRole, ROLES } from '../config/roles.js';

export { mockUsers, mockUsersList };

const CURRENT_USER_KEY = "school_crm_current_user";
const SELECTED_SCHOOL_KEY = "school_crm_selected_school";

export const authService = {
  /**
   * Retrieves the currently authenticated user from session or local storage.
   * Returns null if unauthenticated.
   */
  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored);
      if (user && user.id && user.role) {
        return {
          ...user,
          role: normalizeRole(user.role),
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Returns whether a valid user session is active.
   */
  isAuthenticated: () => {
    return !!authService.getCurrentUser();
  },

  /**
   * Gets the active school context.
   * - For School users (Principal, Teacher, Student), this is fixed to their assigned school.
   * - For Super Admin, this represents their globally selected school view.
   */
  getSelectedSchool: () => {
    const user = authService.getCurrentUser();
    const schools = schoolDataService.getSchools();

    if (user && user.schoolId) {
      const matchedSchool = schools.find((s) => s.id === user.schoolId);
      return matchedSchool || schools[0] || null;
    }

    try {
      const stored = localStorage.getItem(SELECTED_SCHOOL_KEY) || sessionStorage.getItem(SELECTED_SCHOOL_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore storage parse error
    }

    return schools[0] || null;
  },

  /**
   * Updates the selected school (Super Admin global inspection only).
   */
  setSelectedSchool: (school) => {
    const user = authService.getCurrentUser();
    // School tenant users are locked to their own schoolId
    if (user && user.role !== ROLES.SUPER_ADMIN && user.schoolId) {
      return;
    }
    if (school) {
      localStorage.setItem(SELECTED_SCHOOL_KEY, JSON.stringify(school));
    } else {
      localStorage.removeItem(SELECTED_SCHOOL_KEY);
    }
  },

  /**
   * Authenticates user against mock records.
   * Note: In production, this method will dispatch an HTTP POST to /api/auth/login.
   * 
   * @param {Object} credentials { email, password, rollNumber }
   * @param {boolean} rememberMe
   * @returns {Promise<Object>} authenticated user record
   */
  login: async (credentials, rememberMe = true) => {
    const { email, password, rollNumber } = credentials || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanRoll = (rollNumber || '').trim().toUpperCase();

    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    if (!cleanPassword) {
      throw new Error('Please enter your password.');
    }

    // Search across defined mock users
    let matchedUser = mockUsersList.find((u) => u.email.toLowerCase() === cleanEmail);

    // If not in primary mock list, check extended students and teachers database
    if (!matchedUser) {
      const students = schoolDataService.getStudents();
      const matchedStudent = students.find((s) => s.email && s.email.toLowerCase() === cleanEmail);
      if (matchedStudent) {
        matchedUser = {
          id: matchedStudent.id,
          name: matchedStudent.name,
          email: matchedStudent.email,
          rollNumber: matchedStudent.rollNumber || matchedStudent.rollNo || 'STU001',
          password: 'student123',
          role: ROLES.STUDENT,
          class: matchedStudent.class || 'Class 10',
          section: matchedStudent.section || 'A',
          schoolId: matchedStudent.schoolId || 'SCH-001',
          status: (matchedStudent.status || 'active').toLowerCase(),
          avatar: matchedStudent.profilePhoto || mockUsers.student.avatar,
        };
      }
    }

    if (!matchedUser) {
      const teachers = schoolDataService.getTeachers();
      const matchedTeacher = teachers.find((t) => t.email && t.email.toLowerCase() === cleanEmail);
      if (matchedTeacher) {
        matchedUser = {
          id: matchedTeacher.id,
          name: matchedTeacher.name,
          email: matchedTeacher.email,
          password: 'teacher123',
          role: ROLES.TEACHER,
          subject: matchedTeacher.subject || 'Mathematics',
          department: matchedTeacher.department || 'Academics',
          classes: matchedTeacher.classes || ['Class 5'],
          schoolId: matchedTeacher.schoolId || 'SCH-001',
          status: (matchedTeacher.status || 'active').toLowerCase(),
          avatar: matchedTeacher.avatar || mockUsers.teacher.avatar,
        };
      }
    }

    // Strict validation: User must exist
    if (!matchedUser) {
      throw new Error('Invalid email, password, or roll number.');
    }

    // Strict validation: Password must match
    if (matchedUser.password !== cleanPassword) {
      throw new Error('Invalid email, password, or roll number.');
    }

    // Strict validation for Students: Roll Number must match
    if (matchedUser.role === ROLES.STUDENT) {
      if (!cleanRoll) {
        throw new Error('Student roll number is required.');
      }
      const expectedRoll = (matchedUser.rollNumber || '').toUpperCase();
      if (cleanRoll !== expectedRoll) {
        throw new Error('Invalid email, password, or roll number.');
      }
    }

    // Validate active status
    if (matchedUser.status && matchedUser.status.toLowerCase() !== 'active') {
      throw new Error('Account is inactive. Please contact your administrator.');
    }

    // Build standardized session user object
    const userSession = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: normalizeRole(matchedUser.role),
      schoolId: matchedUser.schoolId || null,
      status: matchedUser.status || 'active',
      avatar: matchedUser.avatar,
      title: matchedUser.title,
      rollNumber: matchedUser.rollNumber,
      class: matchedUser.class,
      section: matchedUser.section,
      subject: matchedUser.subject,
      department: matchedUser.department,
    };

    // Store session according to Remember Me preference
    if (rememberMe) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
      sessionStorage.removeItem(CURRENT_USER_KEY);
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
      localStorage.removeItem(CURRENT_USER_KEY);
    }

    // Set school context
    if (userSession.schoolId) {
      const userSchool = schoolDataService.getSchoolById(userSession.schoolId);
      if (userSchool) {
        authService.setSelectedSchool(userSchool);
      }
    }

    return userSession;
  },

  /**
   * Terminates active user session and clears stored tokens/context.
   */
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(SELECTED_SCHOOL_KEY);
    sessionStorage.removeItem(SELECTED_SCHOOL_KEY);
  },

  /**
   * Requests password reset instructions.
   * In frontend demo mode, returns standard secure confirmation.
   */
  forgotPassword: async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      success: true,
      message: 'If this email is registered, password reset instructions will be sent.',
    };
  },
};
