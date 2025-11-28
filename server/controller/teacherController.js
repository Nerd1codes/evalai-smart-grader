// ../controller/teacherController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Teacher from "../model/Teacher.js";

// Helper to generate JWT
const generateToken = (teacher) => {
  return jwt.sign(
    { id: teacher._id, email: teacher.email },
    process.env.JWT_SECRET || "defaultsecret",
    { expiresIn: "7d" }
  );
};

// Helper to send token in cookie + response body
const sendAuthResponse = (res, teacher, message = "Success") => {
  const token = generateToken(teacher);

  // Set token in HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    message,
    teacher: {
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
    },
  });
};

// 🧾 SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Explicitly hash the password here
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
    });

    // Auto-login after signup
    return sendAuthResponse(res, newTeacher, "Signup successful");
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Set cookie + return teacher info
    return sendAuthResponse(res, teacher, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// 👤 GET CURRENT TEACHER PROFILE
export const getMe = async (req, res) => {
  try {
    // req.user.id is set by verifyToken middleware
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teacher = await Teacher.findById(teacherId).select("-password");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
    });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
