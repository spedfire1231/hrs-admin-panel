export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  // ⚠️ ТИМЧАСОВО (щоб перевірити що все працює)
  if (email === "admin@hrs.com" && password === "123456") {
    return res.status(200).json({
      token: "test-token",
      user: {
        id: "1",
        email,
        role: "admin",
        firstName: "Admin",
        lastName: "HRS",
        isOnline: true
      }
    });
  }

  return res.status(401).json({ error: "Invalid credentials" });
}
