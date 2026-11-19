'use strict';
/** RIFQ Muslim - account routes: register, login, profile, password reset. */
const crypto = require('crypto');
const express = require('express');
const {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  hashPassword,
  signToken,
  publicUser,
  requireAuth,
  rateLimit,
  validateCredentials
} = require('../auth');
const { getDb, save } = require('../store');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 30 });

router.post('/register', authLimiter, (req, res) => {
  const { email, password, name, country } = req.body || {};
  const problem = validateCredentials(email, password);
  if (problem) return res.status(400).json({ error: 'invalid_input', message: problem });
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'email_in_use', message: 'An account with this email already exists.' });
  }
  const user = createUser({ email, password, name, country });
  res.status(201).json({ token: signToken(user.id, user.tokenVersion), user: publicUser(user) });
});

router.post('/login', authLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'invalid_input', message: 'Email and password are required.' });
  }
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'Email or password is incorrect.' });
  }
  if (user.disabled) {
    return res.status(403).json({ error: 'account_disabled', message: 'This account has been disabled.' });
  }
  res.json({ token: signToken(user.id, user.tokenVersion), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch('/me', requireAuth, (req, res) => {
  const { name, country } = req.body || {};
  const user = findUserById(req.user.id);
  if (typeof name === 'string' && name.trim()) user.name = name.trim().slice(0, 80);
  if (typeof country === 'string') user.country = country.slice(0, 80);
  save();
  res.json({ user: publicUser(user) });
});

router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = findUserById(req.user.id);
  if (!verifyPassword(currentPassword || '', user.passwordHash)) {
    return res.status(400).json({ error: 'invalid_password', message: 'Current password is incorrect.' });
  }
  const problem = validateCredentials(user.email, newPassword);
  if (problem) return res.status(400).json({ error: 'invalid_input', message: problem });
  user.passwordHash = hashPassword(newPassword);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  save();
  res.json({ token: signToken(user.id, user.tokenVersion), message: 'Password updated. Other devices must sign in again.' });
});

/**
 * Password reset. A 6-digit code valid for 15 minutes is stored server side.
 * Email delivery requires RESEND_API_KEY; without it the response is clearly
 * labelled delivery:"not_configured" and the code is returned so a developer or
 * administrator can complete the flow. Never described as an email being sent.
 */
router.post('/forgot', authLimiter, async (req, res) => {
  const email = String((req.body || {}).email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'invalid_input', message: 'Email is required.' });
  const db = getDb();
  const user = db.users.find((u) => u.email === email);
  const generic = { message: 'If an account exists for this email, a reset code has been created.' };
  if (!user) return res.status(202).json({ ...generic, delivery: 'not_configured' });

  const code = String(crypto.randomInt(100000, 1000000));
  db.resetCodes[user.id] = { code, expires: Date.now() + 15 * 60 * 1000 };
  save();

  if (process.env.RESEND_API_KEY) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESET_FROM_EMAIL || 'RIFQ Muslim <onboarding@resend.dev>',
          to: [email],
          subject: 'RIFQ Muslim password reset code',
          text: `Your RIFQ Muslim password reset code is ${code}. It expires in 15 minutes.`
        })
      });
      if (!r.ok) throw new Error(`resend_${r.status}`);
      return res.status(202).json({ ...generic, delivery: 'email' });
    } catch (err) {
      console.error('[rifq] reset email failed:', err.message);
      return res.status(202).json({ ...generic, delivery: 'email_failed' });
    }
  }

  res.status(202).json({
    ...generic,
    delivery: 'not_configured',
    code,
    note: 'Email delivery is not configured. Add RESEND_API_KEY to send reset codes by email; this code is shown for development and administrator-assisted recovery only.'
  });
});

router.post('/reset', authLimiter, (req, res) => {
  const { email, code, password } = req.body || {};
  const db = getDb();
  const user = db.users.find((u) => u.email === String(email || '').trim().toLowerCase());
  const record = user && db.resetCodes[user.id];
  if (!user || !record || record.code !== String(code || '') || record.expires < Date.now()) {
    return res.status(400).json({ error: 'invalid_code', message: 'Reset code is invalid or has expired.' });
  }
  const problem = validateCredentials(user.email, password);
  if (problem) return res.status(400).json({ error: 'invalid_input', message: problem });
  user.passwordHash = hashPassword(password);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  delete db.resetCodes[user.id];
  save();
  res.json({ token: signToken(user.id, user.tokenVersion), user: publicUser(user) });
});

/** GDPR-style account deletion: removes the account and all synced data. */
router.delete('/me', requireAuth, (req, res) => {
  const db = getDb();
  db.users = db.users.filter((u) => u.id !== req.user.id);
  delete db.data[req.user.id];
  delete db.resetCodes[req.user.id];
  save();
  res.json({ ok: true, message: 'Account and synced data deleted.' });
});

module.exports = router;
