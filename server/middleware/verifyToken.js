import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Reads the cookie set by login
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultsecret"
    );
    req.user = decoded; // Add user info to the request object
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};