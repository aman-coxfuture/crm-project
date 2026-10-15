const LibraryBook = require("../models/LibraryBook");
const IssuedBook = require("../models/IssuedBook");

// ===============================
// GET ALL BOOKS
// ===============================
const getBooks = async (req, res) => {
  try {
    const books = await LibraryBook.find({
      tenantId: req.user.tenantId,
      status: "Active",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Get library books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch library books",
    });
  }
};

// ===============================
// ADD BOOK
// ===============================
const createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, shelfLocation, totalCopies } =
      req.body;

    if (
      !title ||
      !author ||
      !isbn ||
      !category ||
      !shelfLocation ||
      !totalCopies
    ) {
      return res.status(400).json({
        success: false,
        message: "All book fields are required",
      });
    }

    const existingBook = await LibraryBook.findOne({
      isbn,
      tenantId: req.user.tenantId,
    });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists",
      });
    }

    const book = await LibraryBook.create({
      title,
      author,
      isbn,
      category,
      shelfLocation,
      totalCopies,
      availableCopies: totalCopies,
      tenantId: req.user.tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: book,
    });
  } catch (error) {
    console.error("Create library book error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add book",
    });
  }
};

// ===============================
// GET ISSUED BOOKS
// ===============================
const getIssuedBooks = async (req, res) => {
  try {
    const issuedBooks = await IssuedBook.find({
      tenantId: req.user.tenantId,
    })
      .populate("bookId", "title author isbn category")
      .populate("studentId", "name rollNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: issuedBooks,
    });
  } catch (error) {
    console.error("Get issued books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch issued books",
    });
  }
};

// ===============================
// ISSUE BOOK
// ===============================
const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, dueDate } = req.body;

    if (!bookId || !studentId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "bookId, studentId and dueDate are required",
      });
    }

    const book = await LibraryBook.findOne({
      _id: bookId,
      tenantId: req.user.tenantId,
      status: "Active",
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: "No available copies of this book",
      });
    }

    const alreadyIssued = await IssuedBook.findOne({
      bookId,
      studentId,
      tenantId: req.user.tenantId,
      status: { $in: ["Issued", "Overdue"] },
    });

    if (alreadyIssued) {
      return res.status(400).json({
        success: false,
        message: "This book is already issued to this student",
      });
    }

    const issuedBook = await IssuedBook.create({
      bookId,
      studentId,
      dueDate,
      tenantId: req.user.tenantId,
      status: "Issued",
    });

    book.availableCopies -= 1;
    await book.save();

    const populatedIssue = await IssuedBook.findById(issuedBook._id)
      .populate("bookId", "title author isbn category")
      .populate("studentId", "name rollNumber");

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      data: populatedIssue,
    });
  } catch (error) {
    console.error("Issue book error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to issue book",
    });
  }
};

// ===============================
// RETURN BOOK
// ===============================
const returnBook = async (req, res) => {
  try {
    const { id } = req.params;

    const issuedBook = await IssuedBook.findOne({
      _id: id,
      tenantId: req.user.tenantId,
      status: { $in: ["Issued", "Overdue"] },
    });

    if (!issuedBook) {
      return res.status(404).json({
        success: false,
        message: "Issued book record not found",
      });
    }

    issuedBook.returnDate = new Date();
    issuedBook.status = "Returned";

    await issuedBook.save();

    const book = await LibraryBook.findOne({
      _id: issuedBook.bookId,
      tenantId: req.user.tenantId,
    });

    if (book) {
      book.availableCopies += 1;

      if (book.availableCopies > book.totalCopies) {
        book.availableCopies = book.totalCopies;
      }

      await book.save();
    }

    const populatedIssue = await IssuedBook.findById(issuedBook._id)
      .populate("bookId", "title author isbn category")
      .populate("studentId", "name rollNumber");

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: populatedIssue,
    });
  } catch (error) {
    console.error("Return book error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to return book",
    });
  }
};

module.exports = {
  getBooks,
  createBook,
  getIssuedBooks,
  issueBook,
  returnBook,
};
