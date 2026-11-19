'use strict';
/**
 * RIFQ Muslim - shared backend API.
 *
 * Serves the JSON API used by Android, iOS and the web build, plus the static
 * web bundle exported from the same React Native source.
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const { getDb, save } = require('./store');
const { hashPassword, publicUser } = require('./auth');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');

app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '2mb' }));

// Conservative security headers (no external assets are required by the app).
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));
app.use('/api/content', require('./routes/content'));
app.use('/api/quran', require('./routes/content'));
app.use('/api/location', require('./routes/location'));
app.use('/api/places', require('./routes/location'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  const db = getDb();
  res.json({
    status: 'ok',
    app: 'RIFQ Muslim',
    version: '1.0.0',
    developer: 'Eng Mohamud Yusuf',
    users: db.users.length,
    uptime: Math.round(process.uptime()),
    time: new Date().toISOString()
  });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'not_found', path: req.path }));

// Static web build (same React Native source compiled with react-native-web).
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR, { maxAge: '1h', index: 'index.html' }));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    const indexFile = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
    next();
  });
} else {
  app.get('/', (req, res) =>
    res
      .status(200)
      .type('html')
      .send(
        '<pre style="font:14px/1.5 ui-monospace,monospace;padding:24px">RIFQ Muslim API is running.\n' +
          'The web build is not present yet - run: npm run build:web\n\n' +
          'API health: /api/health</pre>'
      )
  );
}

function bootstrapAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !password) return;
  const db = getDb();
  const existing = db.users.find((u) => u.email === email);
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      save();
      console.log('[rifq] existing account promoted to admin:', email);
    }
    return;
  }
  db.users.push({
    id: require('crypto').randomUUID(),
    email,
    name: 'Administrator',
    passwordHash: hashPassword(password),
    role: 'admin',
    country: null,
    createdAt: new Date().toISOString(),
    tokenVersion: 0,
    disabled: false
  });
  save();
  console.log('[rifq] administrator account created:', email);
}

if (require.main === module) {
  bootstrapAdmin();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[rifq] RIFQ Muslim backend listening on 0.0.0.0:${PORT}`);
  });
}

module.exports = { app, publicUser };
