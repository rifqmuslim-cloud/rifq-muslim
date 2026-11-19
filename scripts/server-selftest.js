'use strict';
/**
 * RIFQ Muslim - backend self test.
 *
 * Boots the real server on an isolated port with a throwaway database and
 * exercises the endpoints the Android/iOS clients depend on: health, register,
 * login, profile update, collection push/pull with versioning, Quran delivery,
 * location reverse geocoding, admin protection and account deletion.
 *
 * Run with: npm run check:server
 */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = Number(process.env.SELFTEST_PORT || 4311);
const BASE = `http://127.0.0.1:${PORT}`;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rifq-selftest-'));
const email = `selftest-${Date.now()}@rifq.test`;
const password = 'RifqTest!2026';

let passed = 0;
const failures = [];

function ok(name, detail) {
  passed += 1;
  console.log(`  PASS  ${name}${detail ? ` - ${detail}` : ''}`);
}

function fail(name, detail) {
  failures.push(`${name}${detail ? `: ${detail}` : ''}`);
  console.log(`  FAIL  ${name}${detail ? ` - ${detail}` : ''}`);
}

function check(name, condition, detail) {
  if (condition) ok(name, detail);
  else fail(name, detail);
}

async function call(method, url, body, token) {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

async function waitForServer(timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

async function main() {
  const child = spawn(process.execPath, [path.join(__dirname, '..', 'server', 'index.js')], {
    env: { ...process.env, PORT: String(PORT), DATA_DIR: dataDir, NODE_ENV: 'test', JWT_SECRET: 'selftest-secret-value-0123456789' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const logs = [];
  child.stdout.on('data', (chunk) => logs.push(String(chunk)));
  child.stderr.on('data', (chunk) => logs.push(String(chunk)));

  const cleanup = () => {
    if (!child.killed) child.kill('SIGTERM');
    try {
      fs.rmSync(dataDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  };

  try {
    const up = await waitForServer();
    if (!up) {
      fail('server starts', logs.join('').slice(-600));
      return;
    }
    ok('server starts', `listening on ${PORT}`);

    const health = await call('GET', '/api/health');
    check('health endpoint', health.status === 200 && health.json?.status === 'ok' && health.json?.app === 'RIFQ Muslim', JSON.stringify(health.json));

    const register = await call('POST', '/api/auth/register', { email, password, name: 'Self Test' });
    check('register returns a token', register.status === 201 && typeof register.json?.token === 'string', `status ${register.status}`);
    const token = register.json?.token;

    const duplicate = await call('POST', '/api/auth/register', { email, password, name: 'Self Test' });
    check('duplicate email rejected', duplicate.status >= 400, `status ${duplicate.status}`);

    const weak = await call('POST', '/api/auth/register', { email: `weak-${Date.now()}@rifq.test`, password: '123', name: 'Weak' });
    check('weak password rejected', weak.status >= 400, `status ${weak.status}`);

    const login = await call('POST', '/api/auth/login', { email, password });
    check('login works on a second device', login.status === 200 && typeof login.json?.token === 'string');

    const badLogin = await call('POST', '/api/auth/login', { email, password: 'wrong-password' });
    check('wrong password rejected', badLogin.status === 401 || badLogin.status === 400, `status ${badLogin.status}`);

    const me = await call('GET', '/api/auth/me', null, token);
    check('profile read', me.status === 200 && me.json?.user?.email === email);

    const noAuth = await call('GET', '/api/data');
    check('data requires authentication', noAuth.status === 401, `status ${noAuth.status}`);

    const profile = await call('PATCH', '/api/auth/me', { name: 'Self Test Renamed', prefs: { lang: 'so', calcMethod: 'Makkah' } }, token);
    check('profile update', profile.status === 200 && profile.json?.user?.name === 'Self Test Renamed');

    const push = await call('PUT', '/api/data/bookmarks', { items: [{ id: 'b1', surah: 2, ayah: 255, at: new Date().toISOString() }], version: 0 }, token);
    check('bookmark push', push.status === 200, `status ${push.status}`);

    const pull = await call('GET', '/api/data/bookmarks', null, token);
    check('bookmark pull on another device', pull.status === 200 && (pull.json?.items || []).length === 1, JSON.stringify(pull.json?.items));

    const conflict = await call('PUT', '/api/data/bookmarks', { items: [{ id: 'b2' }], version: 0 }, token);
    check('version conflict reported', conflict.status === 409 && conflict.json?.error === 'version_conflict', `status ${conflict.status}`);

    const badCollection = await call('PUT', '/api/data/not_a_collection', { items: [] }, token);
    check('unknown collection rejected', badCollection.status === 404, `status ${badCollection.status}`);

    const surahs = await call('GET', '/api/quran/surahs');
    const surahCount = (surahs.json?.surahs || surahs.json?.items || []).length;
    check('114 surahs listed', surahs.status === 200 && surahCount === 114, `count ${surahCount}`);

    const surah = await call('GET', '/api/quran/surah/1');
    const ayahs = surah.json?.ayahs || surah.json?.surah?.ayahs || [];
    check('surah text delivered', surah.status === 200 && ayahs.length >= 7, `${ayahs.length} ayahs`);

    const countries = await call('GET', '/api/content/countries');
    const countryList = countries.json?.countries || countries.json?.items || [];
    check('country dataset served', countries.status === 200 && countryList.length > 200, `${countryList.length} countries`);

    const geocode = await call('GET', '/api/location/reverse?lat=2.0469&lon=45.3182');
    const place = geocode.json?.city || geocode.json?.country;
    check('reverse geocoding responds', geocode.status === 200 && Boolean(place), `${geocode.json?.city || '?'}, ${geocode.json?.country || '?'} (${geocode.json?.provider || geocode.json?.source || 'provider'})`);

    const adminBlocked = await call('GET', '/api/admin/users', null, token);
    check('admin routes protected from normal users', adminBlocked.status === 403 || adminBlocked.status === 401, `status ${adminBlocked.status}`);

    const changePassword = await call('POST', '/api/auth/change-password', { currentPassword: password, newPassword: 'RifqTest!2027' }, token);
    check('password change', changePassword.status === 200 && typeof changePassword.json?.token === 'string', `status ${changePassword.status}`);

    const relogin = await call('POST', '/api/auth/login', { email, password: 'RifqTest!2027' });
    check('login with new password', relogin.status === 200);

    const newToken = relogin.json?.token;
    const del = await call('DELETE', '/api/auth/me', null, newToken);
    check('account deletion', del.status === 200, `status ${del.status}`);

    const afterDelete = await call('POST', '/api/auth/login', { email, password: 'RifqTest!2027' });
    check('deleted account cannot sign in', afterDelete.status >= 400, `status ${afterDelete.status}`);
  } catch (error) {
    fail('unexpected error', error.message);
  } finally {
    cleanup();
  }
}

main()
  .then(() => {
    console.log('');
    if (failures.length) {
      console.log(`RESULT: ${passed} passed, ${failures.length} failed`);
      failures.forEach((item) => console.log(` - ${item}`));
      process.exit(1);
    }
    console.log(`RESULT: all ${passed} backend checks passed`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
