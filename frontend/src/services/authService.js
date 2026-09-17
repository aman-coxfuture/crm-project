import { schoolDataService } from "./schoolDataService";
import api from "./api";

const CURRENT_USER_KEY = "school_crm_current_user";
const SELECTED_SCHOOL_KEY = "school_crm_selected_school";

export const mockUsers = {
  superAdmin: {
    id: "USR-SA-01",
    name: "Super Admin",
    email: "admin@crm.com",
    role: "super-admin",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    schoolId: null,
  },
  principal: {
    id: "USR-PR-01",
    name: "Dr. Robert Harrison",
    email: "principal@school.com",
    role: "school-admin",
    title: "Principal & Head of School",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    schoolId: "SCH-001",
  },
  teacher: {
    id: "TCH-001",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    role: "teacher",
    subject: "Mathematics",
    department: "Mathematics & Computing",
    classes: ["Class 5", "Class 6", "Class 7", "Class 8", "Class 9"],
    assignedSubjects: ["Mathematics", "Computer"],
    experience: "7 Years",
    qualification: "M.Sc. Mathematics, B.Ed",
    joiningDate: "2019-08-01",
    phone: "+1 (555) 789-0123",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    schoolId: "SCH-001",
  },
  student: {
    id: "STU001",
    name: "Alex Johnson",
    rollNumber: "STU001",
    email: "student@example.com",
    role: "student",
    class: "Class 10",
    section: "A",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    schoolId: "SCH-001",
  },
};

export const authService = {
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem(CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("educrm_token");
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
    const { email, password, role } = credentials;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const response = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
      role,
    });

    if (!response.success) {
      throw new Error(response.message || "Login failed");
    }

    const backendUser = response.user;

    const roleMap = {
      SUPER_ADMIN: "super-admin",
      ADMIN: "school-admin",
      FACULTY: "teacher",
      STUDENT: "student",
    };

    const frontendRole = roleMap[backendUser.role];

    if (!frontendRole) {
      throw new Error("Invalid user role");
    }

    localStorage.setItem("educrm_token", response.token);

    const userObj = {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      role: frontendRole,
      tenantId: backendUser.tenantId || null,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));

    return userObj;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("educrm_token");
  },
};
