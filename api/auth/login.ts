import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  // ТИМЧАСОВА перевірка (щоб перевірити, що ВСЕ ПРАЦЮЄ)
  if (email === "admin@hrs.com" && password === "1234") {
    return res.status(200).json({
      token: "test-token",
      user: {
        id: "1",
        email,
        role: "admin",
        firstName: "Admin",
        lastName: "HRS",
        isOnline: true,
      },
    });
  }

  return res.status(401).json({ error: "Invalid credentials" });
}