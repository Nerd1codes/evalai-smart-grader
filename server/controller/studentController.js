import Student from "../model/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🟢 SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, usn, email, password } = req.body;

    const existingStudent = await Student.findOne({ usn });
    if (existingStudent) {
      return res.status(400).json({ message: "USN already registered" });
    }

    const newStudent = new Student({ name, usn, email, password });
    await newStudent.save(); // ✅ hashing happens automatically via pre-save hook

    res.status(201).json({
      message: "Signup successful",
      student: {
        id: newStudent._id,
        name: newStudent.name,
        usn: newStudent.usn,
        email: newStudent.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};



// 🟢 LOGIN
export const login = async (req, res) => {
  try {
    const { usn, password } = req.body;

    // 1️⃣ Validate input
    if (!usn || !password) {
      return res.status(400).json({ message: "USN and password are required" });
    }

    // 2️⃣ Find student by USN
    const student = await Student.findOne({ usn });
    if (!student) {
      return res.status(400).json({ message: "Invalid USN or password" });
    }

    // 3️⃣ Compare hashed password correctly
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid USN or password" });
    }

    // 4️⃣ Generate JWT token (optional)
    const token = jwt.sign(
      { id: student._id, usn: student.usn },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "7d" }
    );

    // 5️⃣ Send response
    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        usn: student.usn,
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
