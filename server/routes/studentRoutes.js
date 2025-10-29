import express from "express";
import { signup, login } from "../controller/studentController.js";

const router = express.Router();
router.get("/test", (req, res) => {
  res.json({ message: "working" });
});

router.post("/signup", signup);
router.post("/login", login);

export default router;
