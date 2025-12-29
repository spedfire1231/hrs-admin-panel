import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const MONGO = process.env.MONGO_URL!;
const JWT = process.env.JWT_SECRET!;

// ---- Mongo model ----
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
});

const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

// ---- API ----
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  await mongoose.connect(MONGO);

  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(401).json({ error: "Невірні дані" });
  }

  const token = jwt.sign(
    { userId: user._id },
    JWT,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
}
