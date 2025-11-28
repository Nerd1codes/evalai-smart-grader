import express from "express";
import { signup, login, getMe } from "../controller/teacherController.js"; 
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Teacher route working" });
});

router.post("/signup", signup);
router.post("/login", login);

// ✅ Properly define this route now
router.get("/me", verifyToken, getMe);

export default router;
