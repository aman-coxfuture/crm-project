const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Education CRM Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

// Start server only after MongoDB connection
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
