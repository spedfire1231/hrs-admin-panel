import type { VercelRequest, VercelResponse } from '@vercel/node';

// ✅ Proxy all /api/* requests to Render через Vercel (same-origin для фронта)
// Це прибирає CORS-проблему, бо браузер бачить запит як на той самий домен.

const ORIGIN = process.env.RENDER_API_ORIGIN || 'https://hrs-api.onrender.com';

function pickHeaders(req: VercelRequest) {
  // Не передаємо hop-by-hop заголовки + host
  const hopByHop = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'transfer-encoding',
    'upgrade',
    'host',
  ]);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (!v) continue;
    if (hopByHop.has(k.toLowerCase())) continue;

    // Vercel може дати string | string[]
    if (Array.isArray(v)) headers.set(k, v.join(','));
    else headers.set(k, v);
  }

  // Щоб бекенд знав, що це JSON (якщо клієнт не додав)
  if (!headers.has('content-type') && req.method !== 'GET' && req.method !== 'HEAD') {
    headers.set('content-type', 'application/json');
  }

  return headers;
}

async function readBody(req: VercelRequest): Promise<Buffer | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  // VercelRequest body може бути вже parsed (object/string) або stream
  const anyReq: any = req as any;
  if (anyReq.body == null) {
    // stream
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on('end', () => resolve());
      req.on('error', reject);
    });
    return Buffer.concat(chunks);
  }

  if (Buffer.isBuffer(anyReq.body)) return anyReq.body;
  if (typeof anyReq.body === 'string') return Buffer.from(anyReq.body);
  // object
  return Buffer.from(JSON.stringify(anyReq.body));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Якщо у тебе коли-небудь буде cross-origin, можна відкрити CORS тут.
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).end();
    return;
  }

  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path || '');
  const queryIndex = req.url?.indexOf('?') ?? -1;
  const search = queryIndex >= 0 ? req.url?.slice(queryIndex) : '';
  const targetUrl = `${ORIGIN}/api/${path}${search || ''}`;

  try {
    const body = await readBody(req);

    const r = await fetch(targetUrl, {
      method: req.method,
      headers: pickHeaders(req),
      body: body as any,
      redirect: 'manual',
    });

    // Проксі-статус + заголовки
    res.status(r.status);
    r.headers.forEach((value, key) => {
      // Не дублюємо set-cookie (Vercel інколи свариться), але у тебе токен в localStorage
      if (key.toLowerCase() === 'set-cookie') return;
      res.setHeader(key, value);
    });

    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e: any) {
    res.status(502).json({ error: 'Proxy error', message: e?.message || String(e) });
  }
}
