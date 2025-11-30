// server.js

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
import examRoutes from "./routes/examRoutes.js"; // 🎯 Exam routes

dotenv.config();

const app = express();

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow your frontend(s) to talk to this API
const allowedOrigins = [
  "http://localhost:8080", // your current frontend dev
  "http://localhost:3000", // React default (if you ever use it)
  "http://localhost:5173", // Vite default (if you ever use it)
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools like curl / Postman (no origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// ---------- DB CONNECTION ----------
dbConnect();

// ---------- ROUTES ----------
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/exams", examRoutes); // ✅ important for /api/exams/.../answers & /evaluate

// Simple health check for debugging
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running ✅" });
});

// Root test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running and DB is connected!");
});

// ---------- ERROR HANDLER (so frontend gets JSON, not HTML) ----------
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err.message);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
