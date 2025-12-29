import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 🔴 ВАЖЛИВО
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  // ⛔ тимчасово, щоб перевірити що POST працює
  if (email === 'admin@hrs.com' && password === '1234') {
    return res.status(200).json({
      token: 'test-token',
      user: {
        id: '1',
        email,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'HRS'
      }
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
}
