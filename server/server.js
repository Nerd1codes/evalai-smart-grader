// server.js (Updated & Consolidated)

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dbConnect from "./config/dbConnect.js"; 
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import examRoutes from "./routes/examRoutes.js"; // 🎯 IMPORT THE EXAM ROUTE FILE

dotenv.config(); 
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:8080"], // your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// Connect Database
dbConnect(); 

// Routes
// Your API routes are mounted here. 
// e.g., /api/students, /api/teachers, etc.
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/exams", examRoutes); // 🎯 Exam routes mounted at /api/exams


// Test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running and DB is connected!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));