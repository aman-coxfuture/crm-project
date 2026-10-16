const express = require("express");

const router = express.Router();

const {
  getBooks,
  createBook,
  getIssuedBooks,
  issueBook,
  returnBook,
} = require("../controllers/libraryController");

const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

// ===============================
// LIBRARY BOOKS
// ===============================

// Get all library books
router.get(
  "/books",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN", "FACULTY"),
  getBooks,
);

// Add new library book
router.post(
  "/books",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN"),
  createBook,
);

// ===============================
// ISSUED BOOKS
// ===============================

// Get issued books
router.get(
  "/issues",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN", "FACULTY"),
  getIssuedBooks,
);

// Issue book
router.post(
  "/issues",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN", "FACULTY"),
  issueBook,
);

// Return book
router.patch(
  "/issues/:id/return",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles("ADMIN", "FACULTY"),
  returnBook,
);

module.exports = router;
