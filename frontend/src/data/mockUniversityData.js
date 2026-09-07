export const universityProfile = {
  name: 'Apex Central University of Science & Technology',
  code: 'ACUST-HYD',
  type: 'Central University (Accredited NAAC A+++, NIRF Top 15)',
  campus: 'University Hills, Gachibowli, Hyderabad, Telangana - 500032',
  viceChancellor: 'Prof. Dr. K. Ramanathan, FNA, FASc',
  registrar: 'Dr. G. Subrahmanyam',
  phone: '+91 40 2313 0000',
  email: 'vc@apex-university.ac.in',
  academicYear: '2026-2027 Academic Session',
};

export const universityStats = {
  totalStudents: 18500,
  totalFaculty: 920,
  totalColleges: 32,
  totalDepartments: 24,
  totalPrograms: 48,
  totalCourses: 310,
  activeResearchProjects: 42,
  totalGrants: '₹ 38.4 Cr',
  pendingAdmissions: 1240,
  pendingFees: '₹ 1.24 Cr',
  todayAttendance: '91.8%',
};

export const initialUniversityColleges = [
  {
    id: 'UNIV-COL-001',
    name: 'Apex Institute of Technology & Engineering',
    type: 'Constituent Campus College',
    code: 'AITE-MAIN',
    dean: 'Prof. Dr. B. N. Murthy',
    location: 'Main University Campus, Hyderabad',
    programsOffered: 16,
    students: 4800,
    faculty: 260,
    accreditation: 'NBA Tier-1, NAAC A+++',
    status: 'Active',
  },
  {
    id: 'UNIV-COL-002',
    name: 'School of Medical Sciences & Research Hospital',
    type: 'Constituent Medical College',
    code: 'SMSR-HYD',
    dean: 'Dr. V. Lakshmi Devi, MD, FRCS',
    location: 'Health Sciences Enclave, Hyderabad',
    programsOffered: 8,
    students: 1200,
    faculty: 190,
    accreditation: 'NMC Approved, WHO Listed',
    status: 'Active',
  },
  {
    id: 'UNIV-COL-003',
    name: 'National School of Law & Jurisprudence',
    type: 'Affiliated Autonomous Institute',
    code: 'NSLJ-HYD',
    dean: 'Prof. Justice (Retd.) M. P. Rao',
    location: 'Cyberabad Judicial District',
    programsOffered: 6,
    students: 950,
    faculty: 55,
    accreditation: 'BCI Approved, NAAC A++',
    status: 'Active',
  },
  {
    id: 'UNIV-COL-004',
    name: 'School of Advanced Natural & Chemical Sciences',
    type: 'Constituent Science Institute',
    code: 'SANCS-CAMPUS',
    dean: 'Dr. Debabrata Roy, Ph.D. (Oxford)',
    location: 'North Campus Science Block',
    programsOffered: 12,
    students: 2100,
    faculty: 140,
    accreditation: 'DST-FIST Supported, NAAC A+++',
    status: 'Active',
  },
  {
    id: 'UNIV-COL-005',
    name: 'Deccan School of Management & Global Studies',
    type: 'Affiliated Business School',
    code: 'DSMG-SEC',
    dean: 'Dr. Alistair Fernandez',
    location: 'Secunderabad Campus',
    programsOffered: 4,
    students: 800,
    faculty: 48,
    accreditation: 'AACSB Member, AICTE Approved',
    status: 'Active',
  }
];

export const initialResearchProjects = [
  {
    id: 'RES-PRJ-001',
    title: 'Quantum Key Distribution in High-Noise Satellite Networks',
    pi: 'Prof. Dr. K. Ramanathan',
    coPi: 'Dr. Anandhita Basu',
    department: 'Department of Quantum Physics & Computing',
    fundingAgency: 'DST - Department of Science and Technology',
    grantAmount: '₹ 4,80,00,000',
    duration: '2024 - 2027 (3 Years)',
    status: 'Ongoing',
    publicationsCount: 8,
  },
  {
    id: 'RES-PRJ-002',
    title: 'CRISPR-Cas9 Mediated Gene Editing for Drought Resistant Millets',
    pi: 'Dr. S. K. Manjunatha',
    coPi: 'Dr. Pratibha Das',
    department: 'Department of Biotechnology & Genetics',
    fundingAgency: 'DBT - Department of Biotechnology',
    grantAmount: '₹ 2,95,00,000',
    duration: '2025 - 2028 (3 Years)',
    status: 'Ongoing',
    publicationsCount: 5,
  },
  {
    id: 'RES-PRJ-003',
    title: 'Autonomous Edge AI for Next-Gen Electric Grid Fault Detection',
    pi: 'Prof. B. N. Murthy',
    coPi: 'Dr. Shalini S.',
    department: 'Department of Electrical & Computer Engineering',
    fundingAgency: 'SERB & PowerGrid Industry Grant',
    grantAmount: '₹ 1,75,00,000',
    duration: '2023 - 2026 (3 Years)',
    status: 'In Final Review',
    publicationsCount: 11,
  },
  {
    id: 'RES-PRJ-004',
    title: 'AI Assisted Diagnostics for Rare Pediatric Neurological Disorders',
    pi: 'Dr. V. Lakshmi Devi, MD',
    coPi: 'Dr. Srinivas Teja',
    department: 'School of Medical Sciences',
    fundingAgency: 'ICMR - Indian Council of Medical Research',
    grantAmount: '₹ 3,40,00,000',
    duration: '2024 - 2027 (3 Years)',
    status: 'Ongoing',
    publicationsCount: 6,
  }
];

export const initialResearchers = [
  { id: 'RSC-001', scholarName: 'Arunav Sengupta', fellowship: 'CSIR-JRF Fellow', guide: 'Prof. Dr. K. Ramanathan', department: 'Quantum Physics', thesisTopic: 'Decoherence Mitigation in Photonic Qubits', year: 'Year 3 (Ph.D.)', status: 'Active' },
  { id: 'RSC-002', scholarName: 'Pooja Chandrasekhar', fellowship: 'DBT-BET Fellow', guide: 'Dr. S. K. Manjunatha', department: 'Biotechnology', thesisTopic: 'Transcriptomic Profiling of Sorghum under Arid Stress', year: 'Year 2 (Ph.D.)', status: 'Active' },
  { id: 'RSC-003', scholarName: 'Syed Tariq Hashmi', fellowship: 'Prime Minister Research Fellow (PMRF)', guide: 'Prof. B. N. Murthy', department: 'Computer Engineering', thesisTopic: 'Hardware Acceleration for Sparse Transformers', year: 'Year 4 (Ph.D.)', status: 'Thesis Submitted' },
  { id: 'RSC-004', scholarName: 'Deepa Madhavan', fellowship: 'UGC-NET SRF', guide: 'Dr. Debabrata Roy', department: 'Chemical Sciences', thesisTopic: 'Metal-Organic Frameworks for Solar Hydrogen Evolution', year: 'Year 3 (Ph.D.)', status: 'Active' },
];

export const initialUniversityPrograms = [
  { id: 'PGM-01', code: 'BTECH-ALL', name: 'Bachelor of Technology (Honours/Integrated)', level: 'Undergraduate', duration: '4 Years', departments: 'CSE, ECE, Mech, Civil, Biotech', totalIntake: 1200, status: 'Active' },
  { id: 'PGM-02', code: 'MTECH-RES', name: 'Master of Technology & Research', level: 'Postgraduate', duration: '2 Years', departments: 'AI, Robotics, VLSI, Thermal, Nanotech', totalIntake: 450, status: 'Active' },
  { id: 'PGM-03', code: 'PHD-STEM', name: 'Doctor of Philosophy (Ph.D. STEM & Law)', level: 'Doctoral', duration: '3-5 Years', departments: 'All 24 University Departments', totalIntake: 280, status: 'Active' },
  { id: 'PGM-04', code: 'MBBS-MD', name: 'Bachelor of Medicine & Surgery (MBBS)', level: 'Medical Professional', duration: '5.5 Years', departments: 'Clinical Medicine, Surgery, Pediatrics', totalIntake: 150, status: 'Active' },
  { id: 'PGM-05', code: 'LLM-CORP', name: 'Master of Laws (LL.M Corporate & IP)', level: 'Postgraduate Law', duration: '1 Year (Intensive)', departments: 'Constitutional Law, Cyber Law', totalIntake: 90, status: 'Active' },
];

export const initialUniversityStudents = [
  { id: 'UNIV-STU-001', name: 'Riddhima Sen', enrollmentNo: 'APEX2023-CS-041', program: 'B.Tech CSE (Honours)', college: 'Apex Inst. of Technology', department: 'Computer Science', year: '3rd Year', cgpa: '9.42', status: 'Active', feeStatus: 'Paid' },
  { id: 'UNIV-STU-002', name: 'Tanmay Bharadwaj', enrollmentNo: 'APEX2024-AI-018', program: 'M.Tech AI & Data Science', college: 'Apex Inst. of Technology', department: 'AI & Robotics', year: '2nd Year', cgpa: '9.15', status: 'Active', feeStatus: 'Paid' },
  { id: 'UNIV-STU-003', name: 'Dr. Arunav Sengupta', enrollmentNo: 'APEX2022-PHD-QP02', program: 'Doctor of Philosophy (Ph.D.)', college: 'School of Advanced Sciences', department: 'Quantum Physics', year: '4th Year', cgpa: 'N/A (Research)', status: 'Active', feeStatus: 'Paid' },
  { id: 'UNIV-STU-004', name: 'Shruti Nandakumar', enrollmentNo: 'APEX2023-MED-066', program: 'MBBS (Clinical Year)', college: 'School of Medical Sciences', department: 'General Surgery & Medicine', year: '3rd Year', cgpa: '8.80', status: 'Active', feeStatus: 'Paid' },
  { id: 'UNIV-STU-005', name: 'Harsha Vardhan Reddy', enrollmentNo: 'APEX2024-LAW-009', program: 'LL.M Corporate Law', college: 'National School of Law', department: 'Corporate Law', year: 'Final Year', cgpa: '8.60', status: 'Active', feeStatus: 'Pending' },
];

export const initialUniversityFaculty = [
  { id: 'UNIV-FAC-001', name: 'Prof. Dr. K. Ramanathan', empId: 'UNIV-P-01', designation: 'Senior Chair Professor & VC', department: 'Quantum Physics & Computing', college: 'School of Advanced Sciences', email: 'vc@apex-university.ac.in', phone: '+91 40 2313 0001', status: 'Active' },
  { id: 'UNIV-FAC-002', name: 'Prof. Dr. B. N. Murthy', empId: 'UNIV-P-04', designation: 'Professor & Dean of Engineering', department: 'Electrical & Computer Engineering', college: 'Apex Inst. of Technology', email: 'dean.engg@apex-university.ac.in', phone: '+91 40 2313 1102', status: 'Active' },
  { id: 'UNIV-FAC-003', name: 'Dr. V. Lakshmi Devi', empId: 'UNIV-P-08', designation: 'Professor & Medical Director', department: 'Surgical Oncology', college: 'School of Medical Sciences', email: 'dean.med@apex-university.ac.in', phone: '+91 40 2313 2203', status: 'Active' },
  { id: 'UNIV-FAC-004', name: 'Dr. Debabrata Roy', empId: 'UNIV-P-12', designation: 'Professor & Dean of Science', department: 'Chemical Sciences & Energy', college: 'School of Advanced Sciences', email: 'dean.science@apex-university.ac.in', phone: '+91 40 2313 3304', status: 'Active' },
];
