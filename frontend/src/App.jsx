import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Page
import LoginPage from './pages/auth/LoginPage';

// Super Admin Pages
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import SchoolsManagementPage from './pages/superAdmin/SchoolsManagementPage';
import SuperAdminAnalyticsPage from './pages/superAdmin/SuperAdminAnalyticsPage';
import SuperAdminSettingsPage from './pages/superAdmin/SuperAdminSettingsPage';

// School Admin / Principal Pages
import SchoolAdminDashboard from './pages/school/SchoolAdminDashboard';
import StudentsPage from './pages/school/StudentsPage';
import TeachersPage from './pages/school/TeachersPage';
import StaffPage from './pages/school/StaffPage';
import ClassesPage from './pages/school/ClassesPage';
import AttendancePage from './pages/school/AttendancePage';
import TimetablePage from './pages/school/TimetablePage';
import ExaminationsPage from './pages/school/ExaminationsPage';
import AssignmentsPage from './pages/school/AssignmentsPage';
import FeesPage from './pages/school/FeesPage';
import StaffFeesPage from './pages/school/StaffFeesPage';
import TransportPage from './pages/school/TransportPage';
import LibraryPage from './pages/school/LibraryPage';
import EventsCalendarPage from './pages/school/EventsCalendarPage';
import NoticesPage from './pages/school/NoticesPage';
import LeaveManagementPage from './pages/school/LeaveManagementPage';
import ReportsPage from './pages/school/ReportsPage';
import SchoolSettingsPage from './pages/school/SchoolSettingsPage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherAttendancePage from './pages/teacher/TeacherAttendancePage';
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage';
import TeacherMarksPage from './pages/teacher/TeacherMarksPage';
import TeacherTimetablePage from './pages/teacher/TeacherTimetablePage';
import TeacherLeavePage from './pages/teacher/TeacherLeavePage';
import TeacherNoticesPage from './pages/teacher/TeacherNoticesPage';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentTimetablePage from './pages/student/StudentTimetablePage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentResultsPage from './pages/student/StudentResultsPage';
import StudentFeesPage from './pages/student/StudentFeesPage';
import StudentNoticesPage from './pages/student/StudentNoticesPage';
import StudentLeavePage from './pages/student/StudentLeavePage';

// Frontend Role Guard
function RoleGuard({ allowedRoles, children }) {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(role)) {
    // Redirect to user's assigned dashboard
    if (role === 'super-admin') return <Navigate to="/super-admin/dashboard" replace />;
    if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/school-admin/dashboard" replace />;
  }
  return children;
}

function RootRedirect() {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'super-admin') return <Navigate to="/super-admin/dashboard" replace />;
  if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/school-admin/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Routes>
              {/* Public Login */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<RootRedirect />} />

              {/* SUPER ADMIN PORTAL */}
              <Route
                path="/super-admin"
                element={
                  <RoleGuard allowedRoles={['super-admin']}>
                    <DashboardLayout />
                  </RoleGuard>
                }
              >
                <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="schools" element={<SchoolsManagementPage />} />
                <Route path="analytics" element={<SuperAdminAnalyticsPage />} />
                <Route path="settings" element={<SuperAdminSettingsPage />} />
              </Route>

              {/* SCHOOL ADMIN / PRINCIPAL PORTAL */}
              <Route
                path="/school-admin"
                element={
                  <RoleGuard allowedRoles={['school-admin']}>
                    <DashboardLayout />
                  </RoleGuard>
                }
              >
                <Route index element={<Navigate to="/school-admin/dashboard" replace />} />
                <Route path="dashboard" element={<SchoolAdminDashboard />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="teachers" element={<TeachersPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="classes" element={<ClassesPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="timetable" element={<TimetablePage />} />
                <Route path="exams" element={<ExaminationsPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="fees" element={<FeesPage />} />
                <Route path="staff-fees" element={<StaffFeesPage />} />
                <Route path="transport" element={<TransportPage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="events" element={<EventsCalendarPage />} />
                <Route path="notices" element={<NoticesPage />} />
                <Route path="leave" element={<LeaveManagementPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SchoolSettingsPage />} />
              </Route>

              {/* TEACHER PORTAL */}
              <Route
                path="/teacher"
                element={
                  <RoleGuard allowedRoles={['teacher']}>
                    <DashboardLayout />
                  </RoleGuard>
                }
              >
                <Route index element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="attendance" element={<TeacherAttendancePage />} />
                <Route path="assignments" element={<TeacherAssignmentsPage />} />
                <Route path="marks" element={<TeacherMarksPage />} />
                <Route path="timetable" element={<TeacherTimetablePage />} />
                <Route path="leave" element={<TeacherLeavePage />} />
                <Route path="notices" element={<TeacherNoticesPage />} />
                <Route path="profile" element={<TeacherProfilePage />} />
              </Route>

              {/* STUDENT PORTAL */}
              <Route
                path="/student"
                element={
                  <RoleGuard allowedRoles={['student']}>
                    <DashboardLayout />
                  </RoleGuard>
                }
              >
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfilePage />} />
                <Route path="timetable" element={<StudentTimetablePage />} />
                <Route path="assignments" element={<StudentAssignmentsPage />} />
                <Route path="results" element={<StudentResultsPage />} />
                <Route path="fees" element={<StudentFeesPage />} />
                <Route path="notices" element={<StudentNoticesPage />} />
                <Route path="leave" element={<StudentLeavePage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
