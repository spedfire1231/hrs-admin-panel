export default function handler(req, res) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: "No token" });
  }

  return res.status(200).json({
    user: {
      id: "1",
      email: "admin@hrs.com",
      role: "admin",
      firstName: "Admin",
      lastName: "HRS",
      isOnline: true
    }
  });
}
