import {
  initialSchools,
  initialStudents,
  initialTeachers,
  initialStaff,
  initialDrivers,
  initialVehicles,
  initialRoutes,
  initialClasses,
  initialTimetable,
  initialAttendanceRecords,
  initialExams,
  initialMarks,
  initialAssignments,
  initialFeeStructure,
  initialFeeTransactions,
  initialLibraryBooks,
  initialIssuedBooks,
  initialEvents,
  initialNotices,
  initialLeaves,
} from '../data/mockData';

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
  // --- Schools ---
  getSchools: () => getStorage('schools', initialSchools),
  saveSchools: (data) => setStorage('schools', data),
  addSchool: (school) => {
    const list = schoolDataService.getSchools();
    const newSchool = {
      id: `SCH-${String(list.length + 1).padStart(3, '0')}`,
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'Active',
      studentsCount: 0,
      teachersCount: 0,
      staffCount: 0,
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

  // --- Students ---
  getStudents: () => getStorage('students', initialStudents),
  saveStudents: (data) => setStorage('students', data),
  addStudent: (student) => {
    const list = schoolDataService.getStudents();
    const newStudent = {
      id: `STU${String(list.length + 1).padStart(3, '0')}`,
      rollNumber: student.rollNumber || `STU${String(list.length + 1).padStart(3, '0')}`,
      admissionDate: new Date().toISOString().split('T')[0],
      attendance: 100,
      feeStatus: 'Pending',
      status: 'Active',
      paidFee: 0,
      totalFee: 4500,
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ...student,
    };
    const updated = [newStudent, ...list];
    setStorage('students', updated);
    return newStudent;
  },
  updateStudent: (id, updatedFields) => {
    const list = schoolDataService.getStudents();
    const updated = list.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
    setStorage('students', updated);
    return updated;
  },
  deleteStudent: (id) => {
    const list = schoolDataService.getStudents();
    const updated = list.filter((s) => s.id !== id);
    setStorage('students', updated);
    return updated;
  },

  // --- Teachers ---
  getTeachers: () => getStorage('teachers', initialTeachers),
  saveTeachers: (data) => setStorage('teachers', data),
  addTeacher: (teacher) => {
    const list = schoolDataService.getTeachers();
    const newTeacher = {
      id: `TCH-${String(list.length + 1).padStart(3, '0')}`,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      totalStudents: 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ...teacher,
    };
    const updated = [newTeacher, ...list];
    setStorage('teachers', updated);
    return newTeacher;
  },
  deleteTeacher: (id) => {
    const list = schoolDataService.getTeachers();
    const updated = list.filter((t) => t.id !== id);
    setStorage('teachers', updated);
    return updated;
  },

  // --- Staff ---
  getStaff: () => getStorage('staff', initialStaff),
  saveStaff: (data) => setStorage('staff', data),
  addStaff: (member) => {
    const list = schoolDataService.getStaff();
    const newStaff = {
      id: `STF-${String(list.length + 101)}`,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ...member,
    };
    const updated = [newStaff, ...list];
    setStorage('staff', updated);
    return newStaff;
  },

  // --- Drivers & Transport ---
  getDrivers: () => getStorage('drivers', initialDrivers),
  saveDrivers: (data) => setStorage('drivers', data),
  addDriver: (driver) => {
    const list = schoolDataService.getDrivers();
    const newDriver = {
      id: `DRV-${String(list.length + 1).padStart(3, '0')}`,
      driverId: `DRV-${String(list.length + 1).padStart(3, '0')}`,
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0],
      ...driver,
    };
    const updated = [newDriver, ...list];
    setStorage('drivers', updated);
    return newDriver;
  },
  getVehicles: () => getStorage('vehicles', initialVehicles),
  saveVehicles: (data) => setStorage('vehicles', data),
  getRoutes: () => getStorage('routes', initialRoutes),
  saveRoutes: (data) => setStorage('routes', data),

  // --- Classes & Sections ---
  getClasses: () => getStorage('classes', initialClasses),
  saveClasses: (data) => setStorage('classes', data),

  // --- Timetable ---
  getTimetable: () => getStorage('timetable', initialTimetable),

  // --- Attendance ---
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

  // --- Exams & Marks ---
  getExams: () => getStorage('exams', initialExams),
  saveExams: (data) => setStorage('exams', data),
  addExam: (exam) => {
    const list = schoolDataService.getExams();
    const newExam = {
      id: `EXM-${Date.now().toString().slice(-4)}`,
      status: 'Upcoming',
      schedule: [],
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
  getAssignments: () => getStorage('assignments', initialAssignments),
  saveAssignments: (data) => setStorage('assignments', data),
  addAssignment: (assignment) => {
    const list = schoolDataService.getAssignments();
    const newAsn = {
      id: `ASN-${String(list.length + 101)}`,
      assignedDate: new Date().toISOString().split('T')[0],
      totalSubmissions: 0,
      totalStudents: 36,
      status: 'Active',
      submissions: [],
      ...assignment,
    };
    const updated = [newAsn, ...list];
    setStorage('assignments', updated);
    return newAsn;
  },
  submitAssignmentWork: (assignmentId, studentSubmission) => {
    const list = schoolDataService.getAssignments();
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

  // --- Fees ---
  getFeeStructure: () => getStorage('fee_structure', initialFeeStructure),
  getFeeTransactions: () => getStorage('fee_transactions', initialFeeTransactions),
  recordFeePayment: (payment) => {
    const txns = schoolDataService.getFeeTransactions();
    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      receiptNo: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      paidDate: new Date().toISOString().split('T')[0],
      status: 'Success',
      ...payment,
    };
    const updated = [newTxn, ...txns];
    setStorage('fee_transactions', updated);

    // Also update student feeStatus
    if (payment.studentId) {
      const students = schoolDataService.getStudents();
      const updatedStudents = students.map((s) => {
        if (s.id === payment.studentId) {
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

  // --- Library ---
  getLibraryBooks: () => getStorage('library_books', initialLibraryBooks),
  saveLibraryBooks: (data) => setStorage('library_books', data),
  getIssuedBooks: () => getStorage('issued_books', initialIssuedBooks),
  saveIssuedBooks: (data) => setStorage('issued_books', data),
  issueBook: (issueData) => {
    const issuedList = schoolDataService.getIssuedBooks();
    const newIssue = {
      id: `ISS-${String(issuedList.length + 1).padStart(2, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      fine: 0,
      ...issueData,
    };
    setStorage('issued_books', [newIssue, ...issuedList]);

    // Decrement available copies
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
  getEvents: () => getStorage('events', initialEvents),
  saveEvents: (data) => setStorage('events', data),
  addEvent: (evt) => {
    const list = schoolDataService.getEvents();
    const newEvt = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      status: 'Upcoming',
      ...evt,
    };
    const updated = [newEvt, ...list];
    setStorage('events', updated);
    return newEvt;
  },

  // --- Notices ---
  getNotices: () => getStorage('notices', initialNotices),
  saveNotices: (data) => setStorage('notices', data),
  addNotice: (notice) => {
    const list = schoolDataService.getNotices();
    const newNotice = {
      id: `NTC-${String(list.length + 1).padStart(2, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Active',
      ...notice,
    };
    const updated = [newNotice, ...list];
    setStorage('notices', updated);
    return newNotice;
  },

  // --- Leave Management ---
  getLeaves: () => getStorage('leaves', initialLeaves),
  saveLeaves: (data) => setStorage('leaves', data),
  applyLeave: (leave) => {
    const list = schoolDataService.getLeaves();
    const newLeave = {
      id: `LEV-${String(list.length + 1).padStart(2, '0')}`,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      ...leave,
    };
    const updated = [newLeave, ...list];
    setStorage('leaves', updated);
    return newLeave;
  },
  updateLeaveStatus: (id, status) => {
    const list = schoolDataService.getLeaves();
    const updated = list.map((l) => (l.id === id ? { ...l, status } : l));
    setStorage('leaves', updated);
    return updated;
  },
};
