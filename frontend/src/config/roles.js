/**
 * Centralized Roles and Role-Based Access Configuration
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

// Aliases for backward compatibility with existing components
export const ROLE_ALIASES = {
  'super-admin': ROLES.SUPER_ADMIN,
  'Super Admin': ROLES.SUPER_ADMIN,
  'school-admin': ROLES.PRINCIPAL,
  'School Admin': ROLES.PRINCIPAL,
  'principal': ROLES.PRINCIPAL,
  'Principal': ROLES.PRINCIPAL,
  'teacher': ROLES.TEACHER,
  'Teacher': ROLES.TEACHER,
  'student': ROLES.STUDENT,
  'Student': ROLES.STUDENT,
};

export const ROLE_CONFIG = {
  [ROLES.SUPER_ADMIN]: {
    dashboard: '/super-admin/dashboard',
    portal: 'super-admin',
    label: 'Super Admin',
    badgeColor: 'var(--purple-light)',
    badgeTextColor: 'var(--purple-text)',
  },
  [ROLES.PRINCIPAL]: {
    dashboard: '/school-admin/dashboard',
    portal: 'school',
    label: 'Principal',
    badgeColor: 'var(--primary-light)',
    badgeTextColor: 'var(--primary-text)',
  },
  [ROLES.TEACHER]: {
    dashboard: '/teacher/dashboard',
    portal: 'school',
    label: 'Teacher',
    badgeColor: 'var(--info-light)',
    badgeTextColor: 'var(--info-text)',
  },
  [ROLES.STUDENT]: {
    dashboard: '/student/dashboard',
    portal: 'school',
    label: 'Student',
    badgeColor: 'var(--success-light)',
    badgeTextColor: 'var(--success-text)',
  },
};

/**
 * Normalizes any role string (including legacy variants) to canonical role constant
 */
export function normalizeRole(role) {
  if (!role) return null;
  const cleaned = String(role).trim();
  if (ROLE_ALIASES[cleaned]) return ROLE_ALIASES[cleaned];
  const lower = cleaned.toLowerCase();
  if (lower.includes('super') && lower.includes('admin')) return ROLES.SUPER_ADMIN;
  if (lower.includes('principal') || (lower.includes('school') && lower.includes('admin'))) return ROLES.PRINCIPAL;
  if (lower.includes('teacher')) return ROLES.TEACHER;
  if (lower.includes('student')) return ROLES.STUDENT;
  return role;
}

/**
 * Checks if a given role matches any of the target roles (with alias support)
 */
export function matchesRole(userRole, targetRole) {
  const normUser = normalizeRole(userRole);
  const normTarget = normalizeRole(targetRole);
  return normUser === normTarget;
}

/**
 * Checks if user's role matches any allowed role in list
 */
export function matchesAnyRole(userRole, allowedRoles = []) {
  const normUser = normalizeRole(userRole);
  return allowedRoles.some((target) => normalizeRole(target) === normUser);
}

/**
 * Central dashboard redirection mapping
 */
export function getDashboardRoute(role) {
  const norm = normalizeRole(role);
  if (norm && ROLE_CONFIG[norm]) {
    return ROLE_CONFIG[norm].dashboard;
  }
  return '/login';
}
