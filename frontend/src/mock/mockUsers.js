/**
 * Centralized Mock Users & Credentials for Education CRM (Frontend Demo)
 * 
 * NOTE: Passwords are used strictly for client-side frontend demo authentication.
 * Production systems will integrate real backend JWT/OAuth authentication.
 */

import { ROLES } from '../config/roles.js';

export const mockUsers = {
  superAdmin: {
    id: 'USR-SA-001',
    name: 'Super Admin',
    email: 'admin@crm.com',
    password: 'admin123',
    role: ROLES.SUPER_ADMIN,
    schoolId: null,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Platform Super Administrator',
  },
  principal: {
    id: 'USR-PR-001',
    name: 'Dr. Robert Harrison',
    email: 'principal@school.com',
    password: 'principal123',
    role: ROLES.PRINCIPAL,
    schoolId: 'SCH-001',
    status: 'active',
    title: 'Principal & Head of School',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  teacher: {
    id: 'USR-TCH-001',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'teacher123',
    role: ROLES.TEACHER,
    schoolId: 'SCH-001',
    subject: 'Mathematics',
    department: 'Mathematics & Computing',
    classes: ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9'],
    assignedSubjects: ['Mathematics', 'Computer'],
    experience: '7 Years',
    qualification: 'M.Sc. Mathematics, B.Ed',
    joiningDate: '2019-08-01',
    phone: '+1 (555) 789-0123',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  student: {
    id: 'USR-STU-001',
    name: 'Alex Johnson',
    email: 'student@example.com',
    rollNumber: 'STU001',
    password: 'student123',
    role: ROLES.STUDENT,
    schoolId: 'SCH-001',
    class: 'Class 10',
    section: 'A',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
};

export const mockUsersList = [
  mockUsers.superAdmin,
  mockUsers.principal,
  mockUsers.teacher,
  mockUsers.student,
];
