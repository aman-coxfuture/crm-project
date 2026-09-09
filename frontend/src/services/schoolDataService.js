import {
  SCHOOL_CLASSES,
  PERIOD_SLOTS,
  initialSchools,
  initialStudents,
  initialTeachers,
  initialStaff,
  initialDrivers,
  initialVehicles,
  initialRoutes,
  initialClasses,
  initialTeacherAssignments,
  initialTimetable,
  initialAttendanceRecords,
  initialTeacherAttendance,
  initialStudentAttendanceRecords,
  initialExams,
  initialMarks,
  initialAssignments,
  initialFeeStructure,
  initialStudentFeeLedgers,
  initialLateFineSettings,
  initialFeeTransactions,
  initialLibraryBooks,
  initialIssuedBooks,
  initialEvents,
  initialNotices,
  initialLeaves,
  initialStaffFeeLedgers,
  initialStaffFeeTransactions,
} from '../data/mockData';

export { SCHOOL_CLASSES, PERIOD_SLOTS };

// Helper to initialize or get localStorage collection
function getStorage(key, initialData) {
  try {
    const saved = localStorage.getItem(`crm_${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading localStorage', e);
  }
  return initialData;
}

function setStorage(key, data) {
  try {
    localStorage.setItem(`crm_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing localStorage', e);
  }
}

export const schoolDataService = {
  // --- Classes & Slots Reference ---
  getSchoolClasses: () => SCHOOL_CLASSES,
  getPeriodSlots: () => PERIOD_SLOTS,

  // --- Schools ---
  getSchools: () => getStorage('schools', initialSchools),
  saveSchools: (data) => setStorage('schools', data),
  getSchoolById: (id) => {
    const schools = schoolDataService.getSchools();
    return schools.find((s) => s.id === id) || schools[0] || null;
  },
  addSchool: (school) => {
    const list = schoolDataService.getSchools();
    const newSchool = {
      id: `SCH-${String(list.length + 1).padStart(3, '0')}`,
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'Active',
      studentsCount: 0,
      teachersCount: 0,
      staffCount: 0,
      logo: '🏫',
      ...school,
    };
    const updated = [newSchool, ...list];
    setStorage('schools', updated);
    return newSchool;
  },
  toggleSchoolStatus: (id) => {
    const list = schoolDataService.getSchools();
    const updated = list.map((s) => (s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
    setStorage('schools', updated);
    return updated;
  },

  // --- Students (with School Tenancy Filter) ---
  getStudents: (schoolId) => {
    const list = getStorage('students', initialStudents);
    if (schoolId) {
      return list.filter((s) => !s.schoolId || s.schoolId === schoolId);
    }
    return list;
  },
  saveStudents: (data) => setStorage('students', data),
  addStudent: (student) => {
    const list = getStorage('students', initialStudents);
    const newStudent = {
      id: `STU${String(list.length + 1).padStart(3, '0')}`,
      rollNumber: student.rollNumber || `STU${String(list.length + 1).padStart(3, '0')}`,
      admissionDate: new Date().toISOString().split('T')[0],
      attendance: 100,
      feeStatus: 'Pending',
      status: 'Active',
      paidFee: 0,
      totalFee: 3800,
      schoolId: student.schoolId || 'SCH-001',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ...student,
    };
    const updated = [newStudent, ...list];
    setStorage('students', updated);
    return newStudent;
  },
  updateStudent: (id, updatedFields) => {
    const list = getStorage('students', initialStudents);
    const updated = list.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
    setStorage('students', updated);
    return updated;
  },
  deleteStudent: (id) => {
    const list = getStorage('students', initialStudents);
    const updated = list.filter((s) => s.id !== id);
    setStorage('students', updated);
    return updated;
  },

  // --- Teachers (with School Tenancy Filter) ---
  getTeachers: (schoolId) => {
    const list = getStorage('teachers', initialTeachers);
    if (schoolId) {
      return list.filter((t) => !t.schoolId || t.schoolId === schoolId);
    }
    return list;
  },
  saveTeachers: (data) => setStorage('teachers', data),
  addTeacher: (teacher) => {
    const list = getStorage('teachers', initialTeachers);
    const newTeacher = {
      id: `TCH-${String(list.length + 1).padStart(3, '0')}`,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      totalStudents: 0,
      schoolId: teacher.schoolId || 'SCH-001',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      classes: teacher.classes || ['Class 5'],
      assignedSubjects: [teacher.subject || 'General'],
      ...teacher,
    };
    const updated = [newTeacher, ...list];
    setStorage('teachers', updated);
    return newTeacher;
  },
  deleteTeacher: (id) => {
    const list = getStorage('teachers', initialTeachers);
    const updated = list.filter((t) => t.id !== id);
    setStorage('teachers', updated);
    return updated;
  },

  // --- Teacher Class & Subject Assignments (Principal -> Teacher -> Class) ---
  getTeacherAssignments: (schoolId) => {
    const list = getStorage('teacher_assignments', initialTeacherAssignments);
    if (schoolId) {
      return list.filter((a) => !a.schoolId || a.schoolId === schoolId);
    }
    return list;
  },
  saveTeacherAssignments: (data) => setStorage('teacher_assignments', data),
  assignTeacherToClass: ({ teacherId, teacherName, className, section, subject, room, schoolId = 'SCH-001' }) => {
    const assignments = schoolDataService.getTeacherAssignments();
    const newAssignment = {
      id: `ASN-TCH-${Date.now().toString().slice(-4)}`,
      schoolId,
      teacherId,
      teacherName,
      class: className,
      section: section || 'A',
      subject,
      room: room || 'Room 201',
      assignedDate: new Date().toISOString().split('T')[0],
    };
    const updatedAssignments = [newAssignment, ...assignments];
    setStorage('teacher_assignments', updatedAssignments);

    // Also update teacher's classes list if not already present
    const teachers = schoolDataService.getTeachers();
    const updatedTeachers = teachers.map((t) => {
      if (t.id === teacherId || t.name.toLowerCase() === (teacherName || '').toLowerCase()) {
        const existingClasses = new Set(t.classes || []);
        existingClasses.add(className);
        const existingSubjects = new Set(t.assignedSubjects || [t.subject]);
        existingSubjects.add(subject);
        return {
          ...t,
          classes: Array.from(existingClasses),
          assignedSubjects: Array.from(existingSubjects),
        };
      }
      return t;
    });
    setStorage('teachers', updatedTeachers);

    return newAssignment;
  },

  // --- Staff ---
  getStaff: (schoolId) => {
    const list = getStorage('staff', initialStaff);
    if (schoolId) return list.filter((s) => !s.schoolId || s.schoolId === schoolId);
    return list;
  },
  saveStaff: (data) => setStorage('staff', data),
  addStaff: (member) => {
    const list = getStorage('staff', initialStaff);
    const newStaff = {
      id: `STF-${String(list.length + 101)}`,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      schoolId: member.schoolId || 'SCH-001',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ...member,
    };
    const updated = [newStaff, ...list];
    setStorage('staff', updated);
    return newStaff;
  },

  // --- Drivers & Transport ---
  getDrivers: (schoolId) => {
    const list = getStorage('drivers', initialDrivers);
    if (schoolId) return list.filter((d) => !d.schoolId || d.schoolId === schoolId);
    return list;
  },
  saveDrivers: (data) => setStorage('drivers', data),
  addDriver: (driver) => {
    const list = getStorage('drivers', initialDrivers);
    const newDriver = {
      id: `DRV-${String(list.length + 1).padStart(3, '0')}`,
      driverId: `DRV-${String(list.length + 1).padStart(3, '0')}`,
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0],
      schoolId: driver.schoolId || 'SCH-001',
      ...driver,
    };
    const updated = [newDriver, ...list];
    setStorage('drivers', updated);
    return newDriver;
  },
  getVehicles: (schoolId) => {
    const list = getStorage('vehicles', initialVehicles);
    if (schoolId) return list.filter((v) => !v.schoolId || v.schoolId === schoolId);
    return list;
  },
  saveVehicles: (data) => setStorage('vehicles', data),
  getRoutes: (schoolId) => {
    const list = getStorage('routes', initialRoutes);
    if (schoolId) return list.filter((r) => !r.schoolId || r.schoolId === schoolId);
    return list;
  },
  saveRoutes: (data) => setStorage('routes', data),

  // --- Classes & Sections (Nursery to Class 10) ---
  getClasses: (schoolId) => {
    const list = getStorage('classes', initialClasses);
    if (schoolId) return list.filter((c) => !c.schoolId || c.schoolId === schoolId);
    return list;
  },
  saveClasses: (data) => setStorage('classes', data),

  // --- 7-Period Timetable ---
  getTimetable: () => getStorage('timetable', initialTimetable),
  saveTimetable: (data) => setStorage('timetable', data),

  getTimetableForClass: (classKey) => {
    const all = schoolDataService.getTimetable();
    if (all[classKey]) return all[classKey];
    // Fallback: Return template 7 periods with lunch
    return [
      { period: 1, time: '08:00 - 08:40', monday: 'Mathematics', tuesday: 'English', wednesday: 'Science', thursday: 'Hindi', friday: 'Computer', subject: 'Mathematics', teacher: 'Rahul Sharma', class: classKey, room: 'Room 201' },
      { period: 2, time: '08:40 - 09:20', monday: 'English', tuesday: 'Mathematics', wednesday: 'Social Science', thursday: 'Science', friday: 'English', subject: 'English', teacher: 'Priya Singh', class: classKey, room: 'Room 201' },
      { period: 3, time: '09:20 - 10:00', monday: 'Science', tuesday: 'Hindi', wednesday: 'Mathematics', thursday: 'English', friday: 'Science', subject: 'Science', teacher: 'Amit Kumar', class: classKey, room: 'Room 201' },
      { period: 4, time: '10:00 - 10:40', monday: 'Hindi', tuesday: 'Science', wednesday: 'Computer', thursday: 'Social Science', friday: 'Hindi', subject: 'Hindi', teacher: 'Neha Sharma', class: classKey, room: 'Room 201' },
      { period: 'Lunch', time: '10:40 - 11:10', monday: '🍱 LUNCH BREAK', tuesday: '🍱 LUNCH BREAK', wednesday: '🍱 LUNCH BREAK', thursday: '🍱 LUNCH BREAK', friday: '🍱 LUNCH BREAK', isBreak: true },
      { period: 5, time: '11:10 - 11:50', monday: 'Computer', tuesday: 'Social Science', wednesday: 'English', thursday: 'Mathematics', friday: 'Computer', subject: 'Computer', teacher: 'Rahul Sharma', class: classKey, room: 'Lab 1' },
      { period: 6, time: '11:50 - 12:30', monday: 'Social Science', tuesday: 'Computer', wednesday: 'Hindi', thursday: 'PT', friday: 'Social Science', subject: 'Social Science', teacher: 'Amit Kumar', class: classKey, room: 'Room 201' },
      { period: 7, time: '12:30 - 01:10', monday: 'PT / Games', tuesday: 'Library', wednesday: 'Art & Craft', thursday: 'PT / Games', friday: 'Activity', subject: 'PT', teacher: 'Sports Teacher', class: classKey, room: 'Ground' },
    ];
  },

  getTimetableForTeacher: (teacherNameOrId) => {
    const all = schoolDataService.getTimetable();
    const key = (teacherNameOrId || '').toLowerCase();
    if (key.includes('rahul') || key === 'tch-001') {
      return all['Teacher-Rahul'] || [];
    }
    if (key.includes('priya') || key === 'tch-002') {
      return all['Teacher-Priya'] || [];
    }
    if (key.includes('sarah') || key === 'tch-005') {
      return all['Teacher-Sarah'] || [];
    }
    return all['Teacher-Rahul'] || [];
  },

  // --- Attendance (Student Attendance & Teacher Attendance / Punch In-Out) ---
  getAttendanceRecords: () => getStorage('attendance', initialAttendanceRecords),
  saveAttendance: (classKey, records) => {
    const all = schoolDataService.getAttendanceRecords();
    const updated = {
      ...all,
      [classKey]: records,
    };
    setStorage('attendance', updated);
    return updated;
  },

  // --- Student Attendance Records (Class + Section + Date) ---
  getStudentAttendanceRecords: () => getStorage('student_attendance', initialStudentAttendanceRecords),
  saveStudentAttendanceRecords: (data) => setStorage('student_attendance', data),

  getStudentAttendanceForClass: ({ schoolId = 'SCH-001', className, section = 'A', date = '2026-09-09' }) => {
    const all = schoolDataService.getStudentAttendanceRecords();
    return all.filter(
      (r) =>
        (!r.schoolId || r.schoolId === schoolId) &&
        r.classId === className &&
        r.sectionId === section &&
        r.date === date
    );
  },

  saveStudentAttendance: ({ schoolId = 'SCH-001', teacherId, className, section = 'A', date = '2026-09-09', records }) => {
    const all = schoolDataService.getStudentAttendanceRecords();
    // Filter out previous records for this specific class + section + date
    const filtered = all.filter(
      (r) =>
        !(
          (!r.schoolId || r.schoolId === schoolId) &&
          r.classId === className &&
          r.sectionId === section &&
          r.date === date
        )
    );

    const newRecords = records.map((rec) => ({
      id: `SA-${rec.studentId}-${date}`,
      schoolId,
      teacherId: teacherId || 'TCH-001',
      classId: className,
      sectionId: section,
      studentId: rec.studentId,
      date,
      status: (rec.status || 'present').toLowerCase(),
    }));

    const updated = [...newRecords, ...filtered];
    schoolDataService.saveStudentAttendanceRecords(updated);

    // Also update legacy classKey record map for compatibility
    const classKey = `${className}-${section}`;
    const legacy = schoolDataService.getAttendanceRecords();
    setStorage('attendance', { ...legacy, [classKey]: records });

    return newRecords;
  },

  // --- Teacher Punch In / Out & Faculty Attendance ---
  getTeacherAttendanceRecords: () => getStorage('teacher_attendance', initialTeacherAttendance),
  saveTeacherAttendanceRecords: (data) => setStorage('teacher_attendance', data),

  getTeacherAttendance: (schoolId = 'SCH-001', date = '2026-09-09') => {
    const list = schoolDataService.getTeacherAttendanceRecords();
    const teachers = schoolDataService.getTeachers(schoolId);

    return teachers.map((teacher) => {
      const record = list.find(
        (r) => r.teacherId === teacher.id && (!date || r.date === date) && (!schoolId || r.schoolId === schoolId)
      );
      if (record) {
        return {
          ...record,
          teacherName: teacher.name,
          department: teacher.department,
          subject: teacher.subject,
          avatar: teacher.avatar,
        };
      }
      return {
        id: `TA-${teacher.id}-${date}`,
        schoolId: teacher.schoolId || schoolId,
        teacherId: teacher.id,
        teacherName: teacher.name,
        department: teacher.department,
        subject: teacher.subject,
        avatar: teacher.avatar,
        date: date,
        status: 'not_marked',
        punchIn: '—',
        punchOut: '—',
      };
    });
  },

  getTodayTeacherAttendance: (teacherId, date = '2026-09-09') => {
    const list = schoolDataService.getTeacherAttendanceRecords();
    const found = list.find((r) => r.teacherId === teacherId && r.date === date);
    return found || null;
  },

  getTeacherAttendanceHistory: (teacherId) => {
    const list = schoolDataService.getTeacherAttendanceRecords();
    return list
      .filter((r) => r.teacherId === teacherId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  },

  punchInTeacher: ({ schoolId = 'SCH-001', teacherId, teacherName, date = '2026-09-09', time = '08:02 AM' }) => {
    const list = schoolDataService.getTeacherAttendanceRecords();
    const existingIndex = list.findIndex((r) => r.teacherId === teacherId && r.date === date);

    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status: 'present',
        punchIn: time,
      };
    } else {
      const newRecord = {
        id: `TA-${Date.now().toString().slice(-4)}`,
        schoolId,
        teacherId,
        teacherName: teacherName || 'Rahul Sharma',
        date,
        status: 'present',
        punchIn: time,
        punchOut: '—',
      };
      updated = [newRecord, ...list];
    }
    schoolDataService.saveTeacherAttendanceRecords(updated);
    return updated.find((r) => r.teacherId === teacherId && r.date === date);
  },

  punchOutTeacher: ({ teacherId, date = '2026-09-09', time = '04:15 PM' }) => {
    const list = schoolDataService.getTeacherAttendanceRecords();
    const updated = list.map((r) => {
      if (r.teacherId === teacherId && r.date === date) {
        return {
          ...r,
          punchOut: time,
          status: 'present',
        };
      }
      return r;
    });
    schoolDataService.saveTeacherAttendanceRecords(updated);
    return updated.find((r) => r.teacherId === teacherId && r.date === date);
  },

  setTeacherStatus: ({ schoolId = 'SCH-001', teacherId, teacherName, date = '2026-09-09', status = 'absent' }) => {
    const list = schoolDataService.getTeacherAttendanceRecords();
    const existingIndex = list.findIndex((r) => r.teacherId === teacherId && r.date === date);

    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        punchIn: status === 'absent' ? '—' : updated[existingIndex].punchIn || '08:00 AM',
        punchOut: status === 'absent' ? '—' : updated[existingIndex].punchOut,
      };
    } else {
      const newRecord = {
        id: `TA-${Date.now().toString().slice(-4)}`,
        schoolId,
        teacherId,
        teacherName: teacherName || 'Rahul Sharma',
        date,
        status,
        punchIn: status === 'absent' ? '—' : '08:00 AM',
        punchOut: '—',
      };
      updated = [newRecord, ...list];
    }
    schoolDataService.saveTeacherAttendanceRecords(updated);
    return updated.find((r) => r.teacherId === teacherId && r.date === date);
  },

  getAbsentTeachersToday: (schoolId = 'SCH-001', date = '2026-09-09') => {
    const records = schoolDataService.getTeacherAttendance(schoolId, date);
    return records.filter((r) => r.status === 'absent');
  },

  // --- Exams & Marks ---
  getExams: (schoolId) => {
    const list = getStorage('exams', initialExams);
    if (schoolId) return list.filter((e) => !e.schoolId || e.schoolId === schoolId);
    return list;
  },
  saveExams: (data) => setStorage('exams', data),
  addExam: (exam) => {
    const list = getStorage('exams', initialExams);
    const newExam = {
      id: `EXM-${Date.now().toString().slice(-4)}`,
      status: 'Upcoming',
      schedule: [],
      schoolId: exam.schoolId || 'SCH-001',
      ...exam,
    };
    const updated = [newExam, ...list];
    setStorage('exams', updated);
    return newExam;
  },
  getMarks: () => getStorage('marks', initialMarks),
  saveMarks: (studentId, marksObj) => {
    const all = schoolDataService.getMarks();
    const updated = { ...all, [studentId]: marksObj };
    setStorage('marks', updated);
    return updated;
  },

  // --- Assignments ---
  getAssignments: (schoolId) => {
    const list = getStorage('assignments', initialAssignments);
    if (schoolId) return list.filter((a) => !a.schoolId || a.schoolId === schoolId);
    return list;
  },
  saveAssignments: (data) => setStorage('assignments', data),
  addAssignment: (assignment) => {
    const list = getStorage('assignments', initialAssignments);
    const newAsn = {
      id: `ASN-${String(list.length + 101)}`,
      assignedDate: new Date().toISOString().split('T')[0],
      totalSubmissions: 0,
      totalStudents: 35,
      status: 'Active',
      schoolId: assignment.schoolId || 'SCH-001',
      submissions: [],
      ...assignment,
    };
    const updated = [newAsn, ...list];
    setStorage('assignments', updated);
    return newAsn;
  },
  submitAssignmentWork: (assignmentId, studentSubmission) => {
    const list = getStorage('assignments', initialAssignments);
    const updated = list.map((a) => {
      if (a.id === assignmentId) {
        const existingSub = a.submissions?.filter((s) => s.studentId !== studentSubmission.studentId) || [];
        return {
          ...a,
          submissions: [
            ...existingSub,
            {
              submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              status: 'Submitted',
              marks: null,
              feedback: '',
              ...studentSubmission,
            },
          ],
          totalSubmissions: (a.totalSubmissions || 0) + 1,
        };
      }
      return a;
    });
    setStorage('assignments', updated);
    return updated;
  },

  // --- Fee Management & Ledgers ---
  getLateFineSettings: (schoolId = 'SCH-001') => {
    const settings = getStorage('late_fine_settings', initialLateFineSettings);
    return settings[schoolId] || initialLateFineSettings['SCH-001'] || {
      gracePeriod: 5,
      fineType: 'per_day',
      fineAmount: 50,
      fixedAmount: 500,
    };
  },
  saveLateFineSettings: (newSettings, schoolId = 'SCH-001') => {
    const all = getStorage('late_fine_settings', initialLateFineSettings);
    const updated = { ...all, [schoolId]: { ...all[schoolId], ...newSettings } };
    setStorage('late_fine_settings', updated);
    return updated[schoolId];
  },

  calculateLateFine: (dueDateStr, paidAmount = 0, totalFee = 50000, fineSettings = null, asOfDateStr = '2026-05-10') => {
    const settings = fineSettings || { gracePeriod: 5, fineType: 'per_day', fineAmount: 50, fixedAmount: 500 };
    const paid = Number(paidAmount) || 0;
    const total = Number(totalFee) || 0;
    const isFullyPaid = paid >= total;

    if (isFullyPaid) {
      return {
        lateDays: 0,
        lateDaysAfterGrace: 0,
        fineAmount: 0,
        isOverdue: false,
        status: 'PAID',
        pendingAmount: 0,
        totalOutstanding: 0,
      };
    }

    const due = new Date(dueDateStr);
    const asOf = asOfDateStr ? new Date(asOfDateStr) : new Date('2026-05-10');
    const diffTime = asOf.getTime() - due.getTime();
    const lateDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const gracePeriod = Number(settings.gracePeriod ?? 5);
    const lateDaysAfterGrace = Math.max(0, lateDays - gracePeriod);

    let fineAmount = 0;
    if (lateDaysAfterGrace > 0) {
      if (settings.fineType === 'fixed') {
        fineAmount = Number(settings.fixedAmount || settings.fineAmount || 500);
      } else {
        fineAmount = lateDaysAfterGrace * Number(settings.fineAmount || 50);
      }
    }

    const isOverdue = lateDays > 0;
    let status = 'PENDING';
    if (isOverdue) {
      status = 'OVERDUE';
    } else if (paid > 0) {
      status = 'PARTIAL';
    }

    const pendingAmount = Math.max(0, total - paid);
    const totalOutstanding = pendingAmount + fineAmount;

    return {
      lateDays,
      lateDaysAfterGrace,
      fineAmount,
      isOverdue,
      status,
      pendingAmount,
      totalOutstanding,
    };
  },

  getFeeStructure: (schoolId) => {
    const list = getStorage('fee_structure', initialFeeStructure);
    if (schoolId) return list.filter((f) => !f.schoolId || f.schoolId === schoolId);
    return list;
  },
  saveFeeStructure: (data) => {
    setStorage('fee_structure', data);
    return data;
  },
  addFeeStructure: (item) => {
    const list = schoolDataService.getFeeStructure();
    const newItem = {
      id: `FS-${Date.now().toString().slice(-4)}`,
      schoolId: item.schoolId || 'SCH-001',
      academicSession: item.academicSession || '2026-27',
      frequency: item.frequency || 'Yearly',
      ...item,
    };
    const updated = [newItem, ...list];
    setStorage('fee_structure', updated);
    return newItem;
  },

  getStudentFeeLedgers: (schoolId = 'SCH-001') => {
    const ledgers = getStorage('student_fee_ledgers', initialStudentFeeLedgers);
    const fineSettings = schoolDataService.getLateFineSettings(schoolId);
    
    // Enrich with dynamic deterministic late fines
    const enriched = ledgers
      .filter((l) => !schoolId || !l.schoolId || l.schoolId === schoolId)
      .map((ledger) => {
        const fineResult = schoolDataService.calculateLateFine(
          ledger.dueDate,
          ledger.paidAmount,
          ledger.totalFee,
          fineSettings
        );
        return {
          ...ledger,
          lateDays: fineResult.lateDays,
          lateDaysAfterGrace: fineResult.lateDaysAfterGrace,
          fineAmount: fineResult.fineAmount,
          status: ledger.paidAmount >= ledger.totalFee ? 'PAID' : (ledger.paidAmount > 0 && !fineResult.isOverdue ? 'PARTIAL' : fineResult.status),
          pendingAmount: Math.max(0, ledger.totalFee - ledger.paidAmount),
          totalOutstanding: fineResult.totalOutstanding,
        };
      });

    return enriched;
  },
  saveStudentFeeLedgers: (data) => {
    setStorage('student_fee_ledgers', data);
    return data;
  },

  getFeeTransactions: (schoolId) => {
    const list = getStorage('fee_transactions', initialFeeTransactions);
    if (schoolId) return list.filter((f) => !f.schoolId || f.schoolId === schoolId);
    return list;
  },
  saveFeeTransactions: (data) => {
    setStorage('fee_transactions', data);
    return data;
  },

  recordFeePayment: (payment) => {
    const txns = schoolDataService.getFeeTransactions();
    const receiptSeq = Math.floor(100 + Math.random() * 900);
    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-5)}`,
      receiptNo: payment.receiptNo || `REC-${new Date().getFullYear()}-${receiptSeq}`,
      paidDate: payment.paymentDate || new Date().toISOString().split('T')[0],
      paymentDate: payment.paymentDate || new Date().toISOString().split('T')[0],
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod || payment.mode || 'UPI',
      mode: payment.paymentMethod || payment.mode || 'UPI',
      feeType: payment.feeType || payment.feeHead || 'Tuition Fee',
      feeHead: payment.feeType || payment.feeHead || 'Tuition Fee',
      studentId: payment.studentId,
      studentName: payment.studentName,
      rollNumber: payment.rollNumber,
      class: payment.class,
      classId: payment.classId || payment.class,
      section: payment.section || 'A',
      academicSession: payment.academicSession || '2026-27',
      notes: payment.notes || 'Payment recorded via School CRM counter',
      status: 'Success',
      schoolId: payment.schoolId || 'SCH-001',
    };
    
    const updatedTxns = [newTxn, ...txns];
    setStorage('fee_transactions', updatedTxns);

    // Update Student Fee Ledger
    const allLedgers = getStorage('student_fee_ledgers', initialStudentFeeLedgers);
    const updatedLedgers = allLedgers.map((ledger) => {
      if (ledger.studentId === payment.studentId || ledger.id === payment.ledgerId) {
        const newPaid = Number(ledger.paidAmount || 0) + Number(payment.amount);
        const newPending = Math.max(0, Number(ledger.totalFee || 0) - newPaid);
        
        // Update breakdown if matching feeType
        const updatedBreakdown = (ledger.breakdown || []).map((b) => {
          if (b.type.toLowerCase().includes((payment.feeType || '').toLowerCase().replace(' fee', ''))) {
            const bPaid = Math.min(b.amount, (b.paid || 0) + Number(payment.amount));
            return {
              ...b,
              paid: bPaid,
              pending: Math.max(0, b.amount - bPaid),
              status: bPaid >= b.amount ? 'Paid' : (bPaid > 0 ? 'Partial' : 'Pending'),
            };
          }
          return b;
        });

        const newStatus = newPaid >= ledger.totalFee ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : 'PENDING');

        return {
          ...ledger,
          paidAmount: newPaid,
          pendingAmount: newPending,
          status: newStatus,
          breakdown: updatedBreakdown.length ? updatedBreakdown : ledger.breakdown,
        };
      }
      return ledger;
    });
    setStorage('student_fee_ledgers', updatedLedgers);

    // Also sync student list
    if (payment.studentId) {
      const students = schoolDataService.getStudents();
      const updatedStudents = students.map((s) => {
        if (s.id === payment.studentId || s.studentId === payment.studentId) {
          const newPaid = (s.paidFee || 0) + Number(payment.amount);
          return {
            ...s,
            paidFee: newPaid,
            feeStatus: newPaid >= s.totalFee ? 'Paid' : 'Pending',
          };
        }
        return s;
      });
      schoolDataService.saveStudents(updatedStudents);
    }

    return newTxn;
  },

  getFeeDashboardMetrics: (schoolId = 'SCH-001') => {
    const ledgers = schoolDataService.getStudentFeeLedgers(schoolId);
    const txns = schoolDataService.getFeeTransactions(schoolId);

    const totalStudents = ledgers.length;
    const totalFees = ledgers.reduce((acc, l) => acc + (Number(l.totalFee) || 0), 0);
    const totalCollected = ledgers.reduce((acc, l) => acc + (Number(l.paidAmount) || 0), 0);
    const totalPending = ledgers.reduce((acc, l) => acc + (Number(l.pendingAmount) || 0), 0);
    const totalOverdue = ledgers
      .filter((l) => l.status === 'OVERDUE')
      .reduce((acc, l) => acc + (Number(l.pendingAmount) || 0), 0);
    const totalLateFineCollected = txns
      .filter((t) => (t.feeType || '').toLowerCase().includes('fine') || (t.notes || '').toLowerCase().includes('fine'))
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 75000);

    const statusCounts = {
      PAID: ledgers.filter((l) => l.status === 'PAID').length,
      PARTIAL: ledgers.filter((l) => l.status === 'PARTIAL').length,
      PENDING: ledgers.filter((l) => l.status === 'PENDING').length,
      OVERDUE: ledgers.filter((l) => l.status === 'OVERDUE').length,
    };

    const statusAmounts = {
      PAID: ledgers.filter((l) => l.status === 'PAID').reduce((acc, l) => acc + (Number(l.paidAmount) || 0), 0),
      PARTIAL: ledgers.filter((l) => l.status === 'PARTIAL').reduce((acc, l) => acc + (Number(l.paidAmount) || 0), 0),
      PENDING: ledgers.filter((l) => l.status === 'PENDING').reduce((acc, l) => acc + (Number(l.pendingAmount) || 0), 0),
      OVERDUE: ledgers.filter((l) => l.status === 'OVERDUE').reduce((acc, l) => acc + (Number(l.pendingAmount) || 0), 0),
    };

    return {
      totalStudents,
      totalFees,
      totalCollected,
      totalPending,
      totalOverdue,
      totalLateFineCollected,
      statusCounts,
      statusAmounts,
    };
  },

  // --- Library ---
  getLibraryBooks: (schoolId) => {
    const list = getStorage('library_books', initialLibraryBooks);
    if (schoolId) return list.filter((b) => !b.schoolId || b.schoolId === schoolId);
    return list;
  },
  saveLibraryBooks: (data) => setStorage('library_books', data),
  getIssuedBooks: (schoolId) => {
    const list = getStorage('issued_books', initialIssuedBooks);
    if (schoolId) return list.filter((i) => !i.schoolId || i.schoolId === schoolId);
    return list;
  },
  saveIssuedBooks: (data) => setStorage('issued_books', data),
  issueBook: (issueData) => {
    const issuedList = schoolDataService.getIssuedBooks();
    const newIssue = {
      id: `ISS-${String(issuedList.length + 1).padStart(2, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      fine: 0,
      schoolId: issueData.schoolId || 'SCH-001',
      ...issueData,
    };
    setStorage('issued_books', [newIssue, ...issuedList]);

    const books = schoolDataService.getLibraryBooks();
    const updatedBooks = books.map((b) => (b.id === issueData.bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1), issuedCopies: b.issuedCopies + 1 } : b));
    setStorage('library_books', updatedBooks);
    return newIssue;
  },
  returnBook: (issueId, bookId) => {
    const issuedList = schoolDataService.getIssuedBooks();
    const updated = issuedList.map((i) => (i.id === issueId ? { ...i, status: 'Returned' } : i));
    setStorage('issued_books', updated);

    const books = schoolDataService.getLibraryBooks();
    const updatedBooks = books.map((b) => (b.id === bookId ? { ...b, availableCopies: b.availableCopies + 1, issuedCopies: Math.max(0, b.issuedCopies - 1) } : b));
    setStorage('library_books', updatedBooks);
    return updated;
  },

  // --- Events ---
  getEvents: (schoolId) => {
    const list = getStorage('events', initialEvents);
    if (schoolId) return list.filter((e) => !e.schoolId || e.schoolId === schoolId);
    return list;
  },
  saveEvents: (data) => setStorage('events', data),
  addEvent: (evt) => {
    const list = getStorage('events', initialEvents);
    const newEvt = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      status: 'Upcoming',
      schoolId: evt.schoolId || 'SCH-001',
      ...evt,
    };
    const updated = [newEvt, ...list];
    setStorage('events', updated);
    return newEvt;
  },

  // --- Notices ---
  getNotices: (schoolId) => {
    const list = getStorage('notices', initialNotices);
    if (schoolId) return list.filter((n) => !n.schoolId || n.schoolId === schoolId);
    return list;
  },
  saveNotices: (data) => setStorage('notices', data),
  addNotice: (notice) => {
    const list = getStorage('notices', initialNotices);
    const newNotice = {
      id: `NTC-${String(list.length + 1).padStart(2, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Active',
      schoolId: notice.schoolId || 'SCH-001',
      ...notice,
    };
    const updated = [newNotice, ...list];
    setStorage('notices', updated);
    return newNotice;
  },

  // --- Leave Management ---
  getLeaves: (schoolId) => {
    const list = getStorage('leaves', initialLeaves);
    if (schoolId) return list.filter((l) => !l.schoolId || l.schoolId === schoolId);
    return list;
  },
  saveLeaves: (data) => setStorage('leaves', data),
  applyLeave: (leave) => {
    const list = getStorage('leaves', initialLeaves);
    const newLeave = {
      id: `LEV-${String(list.length + 1).padStart(2, '0')}`,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      schoolId: leave.schoolId || 'SCH-001',
      ...leave,
    };
    const updated = [newLeave, ...list];
    setStorage('leaves', updated);
    return newLeave;
  },
  updateLeaveStatus: (id, status) => {
    const list = getStorage('leaves', initialLeaves);
    const updated = list.map((l) => (l.id === id ? { ...l, status } : l));
    setStorage('leaves', updated);
    return updated;
  },

  // --- Staff Fee / Salary Management ---
  getStaffFeeLedgers: (schoolId) => {
    const list = getStorage('staff_fee_ledgers', initialStaffFeeLedgers);
    if (schoolId) return list.filter((l) => !l.schoolId || l.schoolId === schoolId);
    return list;
  },
  saveStaffFeeLedgers: (data) => setStorage('staff_fee_ledgers', data),

  getStaffFeeTransactions: (schoolId) => {
    const list = getStorage('staff_fee_transactions', initialStaffFeeTransactions);
    if (schoolId) return list.filter((t) => !t.schoolId || t.schoolId === schoolId);
    return list;
  },
  saveStaffFeeTransactions: (data) => setStorage('staff_fee_transactions', data),

  recordStaffPayment: ({
    employeeId,
    amount,
    paymentMonth = 'September 2026',
    paymentDate = new Date().toISOString().split('T')[0],
    paymentMethod = 'Bank Transfer',
    transactionId,
    notes = '',
    schoolId = 'SCH-001',
  }) => {
    const ledgers = schoolDataService.getStaffFeeLedgers(schoolId);
    const numericAmount = Number(amount) || 0;

    let updatedEmployee = null;
    const updatedLedgers = ledgers.map((emp) => {
      if (emp.employeeId === employeeId || emp.id === employeeId) {
        const currentPaid = Number(emp.paidAmount) || 0;
        const salary = Number(emp.monthlySalary) || 0;
        const newPaid = Math.min(salary, currentPaid + numericAmount);
        const newPending = Math.max(0, salary - newPaid);
        const newStatus = newPending === 0 ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'PENDING';

        const historyEntry = {
          month: paymentMonth,
          salary,
          paid: newPaid,
          pending: newPending,
          date: paymentDate,
          method: paymentMethod,
          status: newStatus === 'PAID' ? 'Paid' : newStatus === 'PARTIAL' ? 'Partially Paid' : 'Pending',
          transactionId: transactionId || `TXN-SAL-${Date.now().toString().slice(-4)}`,
        };

        const existingHistory = emp.history || [];
        const filteredHistory = existingHistory.filter((h) => h.month !== paymentMonth);

        updatedEmployee = {
          ...emp,
          paidAmount: newPaid,
          pendingAmount: newPending,
          status: newStatus,
          paymentDate,
          paymentMethod,
          transactionId: transactionId || `TXN-SAL-${Date.now().toString().slice(-4)}`,
          history: [historyEntry, ...filteredHistory],
        };
        return updatedEmployee;
      }
      return emp;
    });

    schoolDataService.saveStaffFeeLedgers(updatedLedgers);

    // Also record transaction in transactions log
    if (updatedEmployee) {
      const txns = schoolDataService.getStaffFeeTransactions(schoolId);
      const newTxn = {
        id: `STXN-${Date.now().toString().slice(-4)}`,
        schoolId,
        receiptNo: `SAL-REC-${Date.now().toString().slice(-6)}`,
        employeeId: updatedEmployee.employeeId,
        employeeName: updatedEmployee.employeeName,
        employeeType: updatedEmployee.employeeType,
        department: updatedEmployee.department,
        paymentMonth,
        amount: numericAmount,
        paymentDate,
        paymentMethod,
        transactionId: transactionId || `TXN-SAL-${Date.now().toString().slice(-4)}`,
        notes: notes || `Salary payment for ${paymentMonth}`,
        status: 'Completed',
      };
      schoolDataService.saveStaffFeeTransactions([newTxn, ...txns]);
    }

    return updatedEmployee;
  },
};
