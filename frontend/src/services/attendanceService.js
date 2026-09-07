import api from './api';
import { mockSchoolStudents, mockCollegeStudents } from '../mock/mockStudents';

export const attendanceService = {
  // --- SCHOOL ATTENDANCE ---
  async getSchoolDailyAttendance(classId, section, date) {
    try {
      // return await api.get('/school/attendance', { params: { classId, section, date } });
      const map = {};
      mockSchoolStudents.forEach((stu) => {
        map[stu.id] = 'Present';
      });
      if (mockSchoolStudents[2]) map[mockSchoolStudents[2].id] = 'Absent';
      return map;
    } catch (error) {
      const map = {};
      mockSchoolStudents.forEach((stu) => { map[stu.id] = 'Present'; });
      return map;
    }
  },

  async saveSchoolAttendance(classId, section, date, attendanceMap) {
    try {
      // return await api.post('/school/attendance', { classId, section, date, attendance: attendanceMap });
      return { success: true, count: Object.keys(attendanceMap).length, date };
    } catch (error) {
      return { success: true, count: Object.keys(attendanceMap).length, date };
    }
  },

  // --- COLLEGE ATTENDANCE ---
  async getCollegeLectureAttendance(dept, semester, subject, date) {
    try {
      // return await api.get('/college/attendance', { params: { dept, semester, subject, date } });
      const map = {};
      mockCollegeStudents.forEach((s) => (map[s.id] = 'Present'));
      return map;
    } catch (error) {
      const map = {};
      mockCollegeStudents.forEach((s) => (map[s.id] = 'Present'));
      return map;
    }
  },

  async saveCollegeLectureAttendance(dept, semester, subject, date, attendanceMap) {
    try {
      // return await api.post('/college/attendance', { dept, semester, subject, date, attendance: attendanceMap });
      return { success: true, count: Object.keys(attendanceMap).length, date };
    } catch (error) {
      return { success: true, count: Object.keys(attendanceMap).length, date };
    }
  },
};

export default attendanceService;
