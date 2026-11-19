'use strict';
/**
 * RIFQ Muslim - authentication and authorization.
 *
 * - Passwords: scrypt (node:crypto) with a per-user random salt.
 * - Tokens: HMAC-SHA256 signed, stateless, 30 day expiry, bound to the user id
 *   and a token version so a password change invalidates old sessions.
 * - Authorization: every /api/sync, /api/data and /api/admin route requires a
 *   verified token; admin routes additionally require role === 'admin'.
 */
const crypto = require('crypto');
const { getDb, save } = require('./store');

const FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn(
    '[rifq] JWT_SECRET is not set. A temporary secret is used, so sessions end when the server restarts. ' +
      'Add JWT_SECRET in Settings -> Environment variables.'
  );
}
const SECRET = process.env.JWT_SECRET || FALLBACK_SECRET;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hash] = parts;
  const candidate = crypto.scryptSync(password, salt, 64);
  const known = Buffer.from(hash, 'hex');
  if (known.length !== candidate.length) return false;
  return crypto.timingSafeEqual(candidate, known);
}

function signToken(userId, tokenVersion = 0, days = 30) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: userId, tv: tokenVersion, iat: now, exp: now + days * 86400 };
  const body = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(
    JSON.stringify(payload)
  ).toString('base64url')}`;
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const body = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  const a = Buffer.from(expected);
  const b = Buffer.from(parts[2]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || !payload.sub) return null;
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return null;
  return payload;
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    country: user.country || null,
    createdAt: user.createdAt,
    disabled: !!user.disabled
  };
}

function findUserById(id) {
  return getDb().users.find((u) => u.id === id) || null;
}

function findUserByEmail(email) {
  const needle = String(email || '').trim().toLowerCase();
  return getDb().users.find((u) => u.email === needle) || null;
}

function createUser({ email, password, name, country }) {
  const db = getDb();
  const user = {
    id: crypto.randomUUID(),
    email: String(email).trim().toLowerCase(),
    name: String(name || '').trim() || String(email).split('@')[0],
    passwordHash: hashPassword(password),
    role: 'user',
    country: country || null,
    createdAt: new Date().toISOString(),
    tokenVersion: 0,
    disabled: false
  };
  db.users.push(user);
  save();
  return user;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'unauthorized' });
  const user = findUserById(payload.sub);
  if (!user || user.disabled) return res.status(401).json({ error: 'unauthorized' });
  if ((user.tokenVersion || 0) !== (payload.tv || 0)) return res.status(401).json({ error: 'session_expired' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    next();
  });
}

/** Simple in-memory rate limiter for auth endpoints (per IP). */
const buckets = new Map();
function rateLimit({ windowMs = 60000, max = 12 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, reset: now + windowMs };
    if (now > bucket.reset) {
      bucket.count = 0;
      bucket.reset = now + windowMs;
    }
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > max) {
      return res.status(429).json({ error: 'too_many_requests', retryAfter: Math.ceil((bucket.reset - now) / 1000) });
    }
    next();
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateCredentials(email, password) {
  if (!EMAIL_RE.test(String(email || ''))) return 'Enter a valid email address.';
  if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 200) return 'Password is too long.';
  return null;
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  publicUser,
  findUserById,
  findUserByEmail,
  createUser,
  requireAuth,
  requireAdmin,
  rateLimit,
  validateCredentials
};
