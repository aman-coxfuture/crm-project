import { api } from "./api.js";
import { normalizeRole, ROLES } from "../config/roles.js";

const CURRENT_USER_KEY = "school_crm_current_user";
const SELECTED_SCHOOL_KEY = "school_crm_selected_school";

export const authService = {
  /**
   * Retrieves the currently authenticated user from session or local storage.
   * Returns null if unauthenticated.
   */
  getCurrentUser: () => {
    try {
      const stored =
        localStorage.getItem(CURRENT_USER_KEY) ||
        sessionStorage.getItem(CURRENT_USER_KEY);
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
    try {
      const stored =
        localStorage.getItem(SELECTED_SCHOOL_KEY) ||
        sessionStorage.getItem(SELECTED_SCHOOL_KEY);

      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
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
   * @param {Object} credentials { email, password, role, schoolCode }
   * @param {boolean} rememberMe
   * @returns {Promise<Object>} authenticated user record
   */
  login: async (credentials, rememberMe = true) => {
    const { email, password, role, schoolCode } = credentials || {};

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();
    const cleanSchoolCode = (schoolCode || "").trim().toUpperCase();
    if (!cleanEmail) {
      throw new Error("Please enter your email address.");
    }

    if (!cleanPassword) {
      throw new Error("Please enter your password.");
    }

    if (!role) {
      throw new Error("Please select your role.");
    }

    const backendRoleMap = {
      [ROLES.SUPER_ADMIN]: "SUPER_ADMIN",
      [ROLES.PRINCIPAL]: "ADMIN",
      [ROLES.TEACHER]: "FACULTY",
      [ROLES.STUDENT]: "STUDENT",
    };

    const backendRole = backendRoleMap[normalizeRole(role)];

    if (!backendRole) {
      throw new Error("Invalid user role.");
    }

    if (backendRole !== "SUPER_ADMIN" && !cleanSchoolCode) {
      throw new Error("Please select your school.");
    }

    const payload = {
      email: cleanEmail,
      password: cleanPassword,
      role: backendRole,
    };

    if (cleanSchoolCode) {
      payload.schoolCode = cleanSchoolCode;
    }

    const response = await api.post("/auth/login", payload);

    if (!response || !response.token || !response.user) {
      throw new Error("Invalid login response from server.");
    }

    const backendUser = response.user;

    const frontendRoleMap = {
      SUPER_ADMIN: ROLES.SUPER_ADMIN,
      ADMIN: ROLES.PRINCIPAL,
      FACULTY: ROLES.TEACHER,
      STUDENT: ROLES.STUDENT,
    };

    const frontendRole = frontendRoleMap[backendUser.role];

    if (!frontendRole) {
      throw new Error("Invalid role returned by server.");
    }

    const userSession = {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      role: normalizeRole(frontendRole),
      schoolId: backendUser.tenantId || null,
      tenantId: backendUser.tenantId || null,
      status: "active",
    };

    if (rememberMe) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
      sessionStorage.removeItem(CURRENT_USER_KEY);

      localStorage.setItem("educrm_token", response.token);
      sessionStorage.removeItem("educrm_token");
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
      localStorage.removeItem(CURRENT_USER_KEY);

      sessionStorage.setItem("educrm_token", response.token);
      localStorage.removeItem("educrm_token");
    }

    return userSession;
  },

  /**
   * Terminates active user session and clears stored tokens/context.
   */
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);

    localStorage.removeItem("educrm_token");
    sessionStorage.removeItem("educrm_token");

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
      message:
        "If this email is registered, password reset instructions will be sent.",
    };
  },
};
