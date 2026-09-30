const express = require("express");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const uploadDir = path.join(__dirname, "../uploads/assignments");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(
      /[^a-zA-Z0-9.-]/g,
      "_",
    )}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

const {
  createCourseworkAssignment,
  getMyCourseworkAssignments,
  getStudentCourseworkAssignments,
  submitCourseworkAssignment,
  getCourseworkAssignmentById,
  gradeCourseworkSubmission,
} = require("../controllers/courseworkAssignmentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const tenantMiddleware = require("../middleware/tenantMiddleware");

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post("/", authorizeRoles("FACULTY"), createCourseworkAssignment);

router.get("/my", authorizeRoles("FACULTY"), getMyCourseworkAssignments);

router.get(
  "/student",
  authorizeRoles("STUDENT"),
  getStudentCourseworkAssignments,
);

router.post(
  "/:id/submit",
  authorizeRoles("STUDENT"),
  upload.single("file"),
  submitCourseworkAssignment,
);

router.patch(
  "/:id/submissions/:studentId/grade",
  authorizeRoles("FACULTY"),
  gradeCourseworkSubmission,
);

router.get("/:id", authorizeRoles("FACULTY"), getCourseworkAssignmentById);

module.exports = router;
