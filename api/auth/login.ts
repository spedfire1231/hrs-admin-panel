import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const MONGO = process.env.MONGO_URL!;
const JWT = process.env.JWT_SECRET!;

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
});

const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // ✅ PRE-FLIGHT
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  await mongoose.connect(MONGO);

  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(401).json({ error: "Невірні дані" });
  }

  const token = jwt.sign({ userId: user._id }, JWT, {
    expiresIn: "7d",
  });

  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
}
