'use strict';
/** RIFQ Muslim - protected administrative operations (role: admin only). */
const express = require('express');
const { requireAdmin, publicUser, hashPassword } = require('../auth');
const { getDb, save, COLLECTIONS } = require('../store');

const router = express.Router();
router.use(requireAdmin);

router.get('/stats', (req, res) => {
  const db = getDb();
  const totalItems = Object.values(db.data).reduce((sum, user) => {
    return sum + Object.values(user).reduce((n, bucket) => n + (Array.isArray(bucket.items) ? bucket.items.length : 0), 0);
  }, 0);
  res.json({
    users: db.users.length,
    admins: db.users.filter((u) => u.role === 'admin').length,
    disabled: db.users.filter((u) => u.disabled).length,
    syncedItems: totalItems,
    collections: COLLECTIONS,
    uptime: Math.round(process.uptime()),
    serverTime: new Date().toISOString()
  });
});

router.get('/users', (req, res) => {
  const db = getDb();
  const q = String(req.query.q || '').trim().toLowerCase();
  const users = db.users
    .filter((u) => !q || u.email.includes(q) || (u.name || '').toLowerCase().includes(q))
    .map((u) => ({ ...publicUser(u), items: Object.values(db.data[u.id] || {}).reduce((n, b) => n + (b.items?.length || 0), 0) }));
  res.json({ count: users.length, users });
});

router.patch('/users/:id', (req, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user_not_found' });
  const { role, disabled, name, password } = req.body || {};
  if (role === 'admin' || role === 'user') user.role = role;
  if (typeof disabled === 'boolean') user.disabled = disabled;
  if (typeof name === 'string' && name.trim()) user.name = name.trim().slice(0, 80);
  if (typeof password === 'string' && password.length >= 8) {
    user.passwordHash = hashPassword(password);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
  }
  db.audit.push({ at: new Date().toISOString(), by: req.user.id, action: 'update_user', target: user.id });
  save();
  res.json({ user: publicUser(user) });
});

router.delete('/users/:id', (req, res) => {
  const db = getDb();
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'cannot_delete_self' });
  const before = db.users.length;
  db.users = db.users.filter((u) => u.id !== req.params.id);
  delete db.data[req.params.id];
  db.audit.push({ at: new Date().toISOString(), by: req.user.id, action: 'delete_user', target: req.params.id });
  save();
  res.json({ ok: true, removed: before - db.users.length });
});

router.get('/audit', (req, res) => {
  res.json({ entries: getDb().audit.slice(-100).reverse() });
});

module.exports = router;
