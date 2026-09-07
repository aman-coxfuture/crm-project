import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Page
import LoginPage from './pages/auth/LoginPage';

// Super Admin Pages
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import InstitutionsPage from './pages/superAdmin/InstitutionsPage';
import UsersPage from './pages/superAdmin/UsersPage';
import AnalyticsPage from './pages/superAdmin/AnalyticsPage';
import GlobalReportsPage from './pages/superAdmin/GlobalReportsPage';
import SuperAdminSettingsPage from './pages/superAdmin/SuperAdminSettingsPage';

// School Pages
import SchoolDashboard from './pages/school/SchoolDashboard';
import SchoolStudentsPage from './pages/school/SchoolStudentsPage';
import SchoolTeachersPage from './pages/school/SchoolTeachersPage';
import SchoolClassesPage from './pages/school/SchoolClassesPage';
import SchoolAttendancePage from './pages/school/SchoolAttendancePage';
import SchoolExamsPage from './pages/school/SchoolExamsPage';
import SchoolFeesPage from './pages/school/SchoolFeesPage';
import SchoolTimetablePage from './pages/school/SchoolTimetablePage';
import SchoolParentsPage from './pages/school/SchoolParentsPage';
import SchoolNoticesPage from './pages/school/SchoolNoticesPage';
import SchoolReportsPage from './pages/school/SchoolReportsPage';

// College Pages
import CollegeDashboard from './pages/college/CollegeDashboard';
import CollegeStudentsPage from './pages/college/CollegeStudentsPage';
import CollegeFacultyPage from './pages/college/CollegeFacultyPage';
import CollegeDepartmentsPage from './pages/college/CollegeDepartmentsPage';
import CollegeCoursesPage from './pages/college/CollegeCoursesPage';
import CollegeAdmissionsPage from './pages/college/CollegeAdmissionsPage';
import CollegeAttendancePage from './pages/college/CollegeAttendancePage';
import CollegeExamsPage from './pages/college/CollegeExamsPage';
import CollegeFeesPage from './pages/college/CollegeFeesPage';
import CollegeNoticesPage from './pages/college/CollegeNoticesPage';
import CollegeReportsPage from './pages/college/CollegeReportsPage';

// University Pages
import UniversityDashboard from './pages/university/UniversityDashboard';
import UniversityCollegesPage from './pages/university/UniversityCollegesPage';
import UniversityResearchPage from './pages/university/UniversityResearchPage';
import UniversityResearchersPage from './pages/university/UniversityResearchersPage';
import UniversityProgramsPage from './pages/university/UniversityProgramsPage';
import UniversityStudentsPage from './pages/university/UniversityStudentsPage';
import UniversityFacultyPage from './pages/university/UniversityFacultyPage';
import UniversityAdmissionsPage from './pages/university/UniversityAdmissionsPage';
import UniversityFeesPage from './pages/university/UniversityFeesPage';
import UniversityNoticesPage from './pages/university/UniversityNoticesPage';
import UniversityReportsPage from './pages/university/UniversityReportsPage';

// Common Pages
import MessagesPage from './pages/common/MessagesPage';
import EventsPage from './pages/common/EventsPage';
import SettingsPage from './pages/common/SettingsPage';
import ProfilePage from './pages/common/ProfilePage';
import NotFoundPage from './pages/common/NotFoundPage';

function RootRedirect() {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${role}/dashboard`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RootRedirect />} />

            {/* SUPER ADMIN PORTAL */}
            <Route path="/super-admin" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="institutions" element={<InstitutionsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="admins" element={<UsersPage />} />
              <Route path="students" element={<SchoolStudentsPage />} />
              <Route path="faculty" element={<CollegeFacultyPage />} />
              <Route path="courses" element={<CollegeCoursesPage />} />
              <Route path="fees" element={<CollegeFeesPage />} />
              <Route path="admissions" element={<CollegeAdmissionsPage />} />
              <Route path="notices" element={<SchoolNoticesPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="reports" element={<GlobalReportsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SuperAdminSettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* SCHOOL CRM PORTAL */}
            <Route path="/school" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/school/dashboard" replace />} />
              <Route path="dashboard" element={<SchoolDashboard />} />
              <Route path="students" element={<SchoolStudentsPage />} />
              <Route path="teachers" element={<SchoolTeachersPage />} />
              <Route path="classes" element={<SchoolClassesPage />} />
              <Route path="timetable" element={<SchoolTimetablePage />} />
              <Route path="attendance" element={<SchoolAttendancePage />} />
              <Route path="exams" element={<SchoolExamsPage />} />
              <Route path="fees" element={<SchoolFeesPage />} />
              <Route path="parents" element={<SchoolParentsPage />} />
              <Route path="notices" element={<SchoolNoticesPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="reports" element={<SchoolReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* COLLEGE CRM PORTAL */}
            <Route path="/college" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/college/dashboard" replace />} />
              <Route path="dashboard" element={<CollegeDashboard />} />
              <Route path="students" element={<CollegeStudentsPage />} />
              <Route path="faculty" element={<CollegeFacultyPage />} />
              <Route path="departments" element={<CollegeDepartmentsPage />} />
              <Route path="courses" element={<CollegeCoursesPage />} />
              <Route path="attendance" element={<CollegeAttendancePage />} />
              <Route path="exams" element={<CollegeExamsPage />} />
              <Route path="timetable" element={<SchoolTimetablePage />} />
              <Route path="admissions" element={<CollegeAdmissionsPage />} />
              <Route path="fees" element={<CollegeFeesPage />} />
              <Route path="notices" element={<CollegeNoticesPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="reports" element={<CollegeReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* UNIVERSITY CRM PORTAL */}
            <Route path="/university" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/university/dashboard" replace />} />
              <Route path="dashboard" element={<UniversityDashboard />} />
              <Route path="colleges" element={<UniversityCollegesPage />} />
              <Route path="programs" element={<UniversityProgramsPage />} />
              <Route path="students" element={<UniversityStudentsPage />} />
              <Route path="faculty" element={<UniversityFacultyPage />} />
              <Route path="research" element={<UniversityResearchPage />} />
              <Route path="researchers" element={<UniversityResearchersPage />} />
              <Route path="admissions" element={<UniversityAdmissionsPage />} />
              <Route path="exams" element={<CollegeExamsPage />} />
              <Route path="fees" element={<UniversityFeesPage />} />
              <Route path="notices" element={<UniversityNoticesPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="reports" element={<UniversityReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
