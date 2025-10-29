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

    const newTeacher = await Teacher.create({ name, email, password });

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

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: teacher._id, email: teacher.email },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      teacher: {
        name: teacher.name,
        email: teacher.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};
