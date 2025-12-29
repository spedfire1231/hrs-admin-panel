import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

const JWT = process.env.JWT_SECRET!;

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).end();

    const decoded = jwt.verify(token, JWT);
    res.json({ user: decoded });
  } catch {
    res.status(401).end();
  }
}
