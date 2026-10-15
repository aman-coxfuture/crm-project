import api from "./api";

const libraryService = {
  // =========================
  // BOOKS
  // =========================

  getBooks: () => api.get("/library/books"),

  createBook: (data) => api.post("/library/books", data),

  // =========================
  // ISSUED BOOKS
  // =========================

  getIssuedBooks: () => api.get("/library/issues"),

  issueBook: (data) => api.post("/library/issues", data),

  returnBook: (id) => api.patch(`/library/issues/${id}/return`),
};

export default libraryService;
