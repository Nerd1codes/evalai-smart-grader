// ../controller/teacherController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Teacher from "../model/Teacher.js";

// 🧾 SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher)
      return res.status(400).json({ message: "Email already registered" });

    // Create teacher (assuming password hashing is handled by the Mongoose model)
    const newTeacher = await Teacher.create({
      name,
      email,
      password, // Sending plain password to the model
    });

    res.status(201).json({
      message: "Signup successful",
      teacher: {
        id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const teacher = await Teacher.findOne({ email });
    if (!teacher)
      return res.status(400).json({ message: "Invalid email or password" });

    // Compare plain-text password from req.body with hashed password from DB
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: teacher._id, email: teacher.email },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "7d" }
    );

    // 🍪 SET THE TOKEN IN AN HTTP-ONLY COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      teacher: {
        name: teacher.name,
        email: teacher.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user.id is added by the verifyToken middleware
    const teacherId = req.user.id;

    const teacher = await Teacher.findById(teacherId).select("-password"); // Exclude password hash

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};