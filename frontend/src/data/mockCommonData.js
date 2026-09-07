export const initialNotices = {
  'super-admin': [
    { id: 'NOT-SA-01', title: 'Scheduled Platform Maintenance & Database Sharding Update', date: '2026-09-08', priority: 'High', author: 'System DevOps', audience: 'All Institutions & Admins', status: 'Published' },
    { id: 'NOT-SA-02', title: 'Annual Educational Compliance & NIRF / NAAC Data Filing Deadline', date: '2026-09-20', priority: 'Medium', author: 'Academic Regulatory Cell', audience: 'Colleges & Universities', status: 'Published' },
    { id: 'NOT-SA-03', title: 'Security Advisory: Mandatory 2FA Deployment for Administrator Accounts', date: '2026-09-12', priority: 'Urgent', author: 'InfoSec Team', audience: 'All System Admins', status: 'Published' },
  ],
  'school': [
    { id: 'NOT-SCH-01', title: 'Parent-Teacher Meeting (PTM) for Term 1 Mid-Term Evaluation', date: '2026-09-18', priority: 'High', author: 'Principal Office', audience: 'All Parents & Students', status: 'Published' },
    { id: 'NOT-SCH-02', title: 'CBSE Regional Science Exhibition & Olympiad Registrations Open', date: '2026-09-15', priority: 'Medium', author: 'Science Department', audience: 'Class 8 to 12', status: 'Published' },
    { id: 'NOT-SCH-03', title: 'Autumn Break Schedule Announcement for Academic Year 2026', date: '2026-09-25', priority: 'Low', author: 'Administration', audience: 'All School', status: 'Published' },
  ],
  'college': [
    { id: 'NOT-COL-01', title: 'Campus Placement Drive 2026-27: Registration for Tier-1 Tech Firms', date: '2026-09-12', priority: 'High', author: 'Training & Placement Cell', audience: 'Final & Pre-Final Year B.Tech', status: 'Published' },
    { id: 'NOT-COL-02', title: 'Continuous Internal Evaluation (CIE-1) Schedule Released', date: '2026-09-14', priority: 'High', author: 'Controller of Examinations', audience: 'All UG & PG Students', status: 'Published' },
    { id: 'NOT-COL-03', title: 'Call for Papers: 9th International Conference on AI & Smart Systems (ICAISS)', date: '2026-09-28', priority: 'Medium', author: 'R&D Cell', audience: 'Faculty & PG Scholars', status: 'Published' },
  ],
  'university': [
    { id: 'NOT-UNIV-01', title: 'University 34th Annual Convocation Ceremony Date & Gown Protocol', date: '2026-10-10', priority: 'High', author: 'Registrar Office', audience: 'Graduating Batches & Faculty', status: 'Published' },
    { id: 'NOT-UNIV-02', title: 'Call for DST-SERB & University Seed Research Grant Proposals (Cycle-II)', date: '2026-09-30', priority: 'High', author: 'Dean of Research & Development', audience: 'All Faculty & Ph.D. Supervisors', status: 'Published' },
    { id: 'NOT-UNIV-03', title: 'National Academic Depository (NAD) DigiLocker Credit Transfer Verification', date: '2026-09-22', priority: 'Medium', author: 'Academic Section', audience: 'All Affiliated Colleges', status: 'Published' },
  ]
};

export const initialEvents = {
  'super-admin': [
    { id: 'EV-SA-01', title: 'All-India EduTech Leadership Summit 2026', date: '2026-10-15', location: 'Vigyan Bhawan, New Delhi', organizer: 'EduCRM Board', attendees: 350 },
    { id: 'EV-SA-02', title: 'National Higher Education Accreditation Workshop', date: '2026-11-04', location: 'Virtual Webex', organizer: 'Academic Quality Council', attendees: 520 },
  ],
  'school': [
    { id: 'EV-SCH-01', title: 'Annual Inter-School Cultural & Performing Arts Fest', date: '2026-10-08', location: 'Main School Auditorium', organizer: 'Cultural Committee', attendees: 1200 },
    { id: 'EV-SCH-02', title: 'Annual Sports Day & Athletic Meet 2026', date: '2026-11-14', location: 'Main Sports Complex', organizer: 'Physical Education Dept', attendees: 2400 },
  ],
  'college': [
    { id: 'EV-COL-01', title: 'TechnoHacks 2026 - 36-Hour National Hackathon', date: '2026-09-26', location: 'Innovation Hub, Block C', organizer: 'CSE & AI Department', attendees: 480 },
    { id: 'EV-COL-02', title: 'Annual Alumni Global Conclave & Industry Connect', date: '2026-10-24', location: 'Convention Centre', organizer: 'Alumni Relations', attendees: 650 },
  ],
  'university': [
    { id: 'EV-UNIV-01', title: 'International Conclave on Quantum Computing & Materials Science', date: '2026-11-18', location: 'University Convention Hall', organizer: 'Centre for Advanced Research', attendees: 850 },
    { id: 'EV-UNIV-02', title: 'All-University Inter-Collegiate Youth Festival (Spandana 2026)', date: '2026-12-02', location: 'Open Air Amphitheatre', organizer: 'Dean of Student Affairs', attendees: 4500 },
  ]
};

export const initialMessages = [
  { id: 'MSG-01', sender: 'Prof. Sunita Rao', role: 'College Dean', subject: 'Inquiry regarding NBA Accreditation report upload', time: '10:30 AM', unread: true },
  { id: 'MSG-02', sender: 'Dr. Rajesh Sharma', role: 'School Principal', subject: 'Class 10 CBSE Board registration roster approved', time: 'Yesterday', unread: false },
  { id: 'MSG-03', sender: 'Finance Controller', role: 'Accounts', subject: 'Quarterly fee reconciliation report generated', time: '2 days ago', unread: false },
  { id: 'MSG-04', sender: 'Central Registrar', role: 'University Admin', subject: 'Ph.D. viva voce examination schedule for Department of Physics', time: '3 days ago', unread: false },
];
