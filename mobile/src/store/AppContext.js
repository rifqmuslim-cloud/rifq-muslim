/**
 * RIFQ Muslim - application state.
 *
 * Owns: preferences, the detected location, computed prayer times, the ticking
 * clock, authentication and the synchronized collections that keep Android,
 * iOS and web in agreement through the shared backend.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { api, setAuthToken } from '../api';
import { loadJSON, saveJSON, clearAll } from '../lib/storage';
import { makeTheme } from '../theme';
import { t as translate, isRTL } from '../i18n';
import { detectLocation, manualLocation, MODES } from '../lib/location';
import {
  computePrayerTimes,
  nextPrayer,
  formatTime,
  zoneInfo,
  suggestedMethod,
  prayerRows
} from '../lib/prayer';
import { hijriLabel, hijriParts } from '../lib/hijri';
import { schedulePrayerNotifications, NOTIFICATIONS_SUPPORTED } from '../lib/notify';

const EMPTY_COLLECTIONS = { quran: [], tasbih: [], worship: [], favorites: [], prefs: [] };

export const DEFAULT_PREFS = {
  lang: 'en',
  dark: false,
  hour12: true,
  calcMethod: 'MWL',
  methodLocked: false,
  madhab: 'shafi',
  highLatitude: 'middle',
  autoLocation: true,
  showTransliteration: true,
  showTranslation: true,
  reciter: 'ar.alafasy',
  notifications: {
    enabled: false,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    preMinutes: 0
  }
};

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

function mergeCollections(local, remote) {
  const out = { ...EMPTY_COLLECTIONS };
  for (const key of Object.keys(EMPTY_COLLECTIONS)) {
    const map = new Map();
    for (const item of local?.[key] || []) if (item && item.id) map.set(item.id, item);
    for (const item of remote?.[key] || []) {
      if (!item || !item.id) continue;
      const existing = map.get(item.id);
      const a = existing ? new Date(existing.updatedAt || 0).getTime() : 0;
      const b = new Date(item.updatedAt || 0).getTime();
      if (!existing || b >= a) map.set(item.id, item);
    }
    out[key] = Array.from(map.values());
  }
  return out;
}

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('idle');
  const [locError, setLocError] = useState(null);
  const [auth, setAuth] = useState({ token: null, user: null });
  const [collections, setCollections] = useState(EMPTY_COLLECTIONS);
  const [now, setNow] = useState(new Date());
  const [onboarded, setOnboarded] = useState(false);
  const [syncState, setSyncState] = useState({ status: 'idle', at: null, error: null });
  const [notifState, setNotifState] = useState({ supported: NOTIFICATIONS_SUPPORTED, scheduled: 0, error: null });
  const [nav, setNav] = useState({ tab: 'home', screen: 'home', params: {}, history: [] });
  const [booting, setBooting] = useState(true);

  const skipPush = useRef(true);
  const pushTimer = useRef(null);
  const authRef = useRef(auth);
  authRef.current = auth;

  /* ------------------------------------------------------------------ boot */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedPrefs, storedLoc, storedAuth, storedCollections, storedOnboarded] = await Promise.all([
        loadJSON('prefs', null),
        loadJSON('location', null),
        loadJSON('auth', null),
        loadJSON('collections', null),
        loadJSON('onboarded', false)
      ]);
      if (cancelled) return;
      if (storedPrefs) {
        setPrefs({
          ...DEFAULT_PREFS,
          ...storedPrefs,
          notifications: { ...DEFAULT_PREFS.notifications, ...(storedPrefs.notifications || {}) }
        });
      }
      if (storedLoc) {
        setLocation(storedLoc);
        setLocStatus('ready');
      }
      if (storedCollections) setCollections({ ...EMPTY_COLLECTIONS, ...storedCollections });
      setOnboarded(!!storedOnboarded);
      if (storedAuth?.token) {
        setAuthToken(storedAuth.token);
        setAuth(storedAuth);
        try {
          const me = await api.me();
          if (!cancelled) setAuth({ token: storedAuth.token, user: me.user });
        } catch (err) {
          if (err.status === 401) {
            setAuthToken(null);
            setAuth({ token: null, user: null });
          }
        }
      }
      setReady(true);
      setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------- clock (1 Hz) */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* -------------------------------------------------------- persistence */
  useEffect(() => {
    if (!ready) return;
    saveJSON('prefs', prefs);
  }, [prefs, ready]);

  useEffect(() => {
    if (!ready) return;
    saveJSON('location', location);
  }, [location, ready]);

  useEffect(() => {
    if (!ready) return;
    saveJSON('auth', auth);
  }, [auth, ready]);

  useEffect(() => {
    if (!ready) return;
    saveJSON('onboarded', onboarded);
  }, [onboarded, ready]);

  useEffect(() => {
    if (!ready) return;
    saveJSON('collections', collections);
  }, [collections, ready]);

  /* ------------------------------------------------------------- location */
  const refreshLocation = useCallback(
    async (options = {}) => {
      setLocStatus('detecting');
      setLocError(null);
      const result = await detectLocation(prefs.lang);
      if (result.ok) {
        setLocation(result.location);
        setLocStatus('ready');
        if (!prefs.methodLocked) {
          const method = suggestedMethod(result.location.countryCode);
          setPrefs((p) => ({ ...p, calcMethod: method }));
        }
      } else {
        setLocStatus('error');
        setLocError(result.reason);
      }
      return result;
    },
    [prefs.lang, prefs.methodLocked]
  );

  const chooseManual = useCallback((manual) => {
    setLocation({ ...manual, mode: MODES.MANUAL });
    setLocStatus('ready');
    setLocError(null);
    if (!prefs.methodLocked && manual.countryCode) {
      setPrefs((p) => ({ ...p, calcMethod: suggestedMethod(manual.countryCode) }));
    }
  }, [prefs.methodLocked]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setLocStatus('idle');
    setLocError(null);
  }, []);

  /* auto-detect on first run when the user has automatic location enabled */
  useEffect(() => {
    if (!ready) return;
    if (location) return;
    if (!prefs.autoLocation) return;
    refreshLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* refresh when the app returns to the foreground (travel detection) */
  useEffect(() => {
    if (!ready || !prefs.autoLocation) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && location?.mode === MODES.GPS) {
        const last = new Date(location.updatedAt || 0).getTime();
        if (Date.now() - last > 15 * 60 * 1000) refreshLocation();
      }
    });
    return () => sub?.remove?.();
  }, [ready, prefs.autoLocation, location, refreshLocation]);

  /* --------------------------------------------------------------- prayer */
  const latitude = location?.latitude ?? null;
  const longitude = location?.longitude ?? null;
  const timezone = location?.timezone || 'UTC';
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const times = useMemo(() => {
    if (latitude == null || longitude == null) return null;
    return computePrayerTimes({ latitude, longitude, date: now, prefs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, dayKey, prefs.calcMethod, prefs.madhab, prefs.highLatitude]);

  const upcoming = useMemo(() => {
    if (latitude == null || longitude == null) return null;
    return nextPrayer({ latitude, longitude, now, prefs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, dayKey, prefs.calcMethod, prefs.madhab, prefs.highLatitude, now]);

  const zone = useMemo(() => zoneInfo(timezone, now), [timezone, dayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const localTime = formatTime(now, { timeZone: timezone, hour12: prefs.hour12, withSeconds: true });
  const localDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(prefs.lang === 'ar' ? 'ar' : 'en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: timezone
      }).format(now);
    } catch {
      return now.toDateString();
    }
  }, [now, timezone, prefs.lang]);

  const hijri = hijriLabel(now, { timeZone: timezone, lang: prefs.lang });
  const hijriNow = hijriParts(now, timezone);
  const inRamadan = !!hijriNow && hijriNow.month === 9;

  const rows = useMemo(() => prayerRows(times), [times]);

  /* --------------------------------------------------------- notifications */
  useEffect(() => {
    if (!ready || latitude == null) return;
    let cancelled = false;
    (async () => {
      const result = await schedulePrayerNotifications({
        latitude,
        longitude,
        prefs,
        lang: prefs.lang,
        days: 7
      });
      if (!cancelled) setNotifState(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, latitude, longitude, prefs.notifications, prefs.calcMethod, prefs.madhab, prefs.highLatitude]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------------------------------------------ sync */
  const pullRemote = useCallback(async () => {
    const token = authRef.current.token;
    if (!token) return null;
    setSyncState((s) => ({ ...s, status: 'syncing' }));
    try {
      const snapshot = await api.syncSnapshot();
      skipPush.current = true;
      setCollections((local) => mergeCollections(local, snapshot.collections || {}));
      setSyncState({ status: 'ok', at: new Date().toISOString(), error: null });
      return snapshot;
    } catch (err) {
      setSyncState({ status: 'error', at: new Date().toISOString(), error: err.message });
      return null;
    }
  }, []);

  const pushRemote = useCallback(async () => {
    const token = authRef.current.token;
    if (!token) return;
    setSyncState((s) => ({ ...s, status: 'syncing' }));
    try {
      await api.pushBulk({
        quran: collections.quran,
        tasbih: collections.tasbih,
        worship: collections.worship,
        favorites: collections.favorites,
        prefs: collections.prefs
      });
      setSyncState({ status: 'ok', at: new Date().toISOString(), error: null });
    } catch (err) {
      setSyncState({ status: 'error', at: new Date().toISOString(), error: err.message });
    }
  }, [collections]);

  useEffect(() => {
    if (!ready || !auth.token) return;
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => pushRemote(), 1200);
    return () => clearTimeout(pushTimer.current);
  }, [collections, auth.token, ready, pushRemote]);

  /* --------------------------------------------------------- collection ops */
  const upsert = useCallback((collection, item) => {
    setCollections((prev) => {
      const list = prev[collection] ? [...prev[collection]] : [];
      const stamped = { ...item, updatedAt: new Date().toISOString() };
      const index = list.findIndex((entry) => entry.id === stamped.id);
      if (index >= 0) list[index] = { ...list[index], ...stamped };
      else list.push(stamped);
      return { ...prev, [collection]: list };
    });
  }, []);

  const removeItem = useCallback((collection, id) => {
    setCollections((prev) => ({
      ...prev,
      [collection]: (prev[collection] || []).filter((entry) => entry.id !== id)
    }));
  }, []);

  /* ------------------------------------------------------------------ auth */
  const signIn = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    setAuthToken(res.token);
    setAuth({ token: res.token, user: res.user });
    skipPush.current = true;
    try {
      const snapshot = await api.syncSnapshot();
      setCollections((local) => mergeCollections(local, snapshot.collections || {}));
      setSyncState({ status: 'ok', at: new Date().toISOString(), error: null });
    } catch (err) {
      setSyncState({ status: 'error', at: new Date().toISOString(), error: err.message });
    }
    return res;
  }, []);

  const signUp = useCallback(
    async (email, password, name) => {
      await api.register(email, password, name);
      return signIn(email, password);
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setAuth({ token: null, user: null });
    setSyncState({ status: 'idle', at: null, error: null });
    await saveJSON('auth', { token: null, user: null });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.me();
      setAuth((prev) => ({ ...prev, user: res.user }));
      return res.user;
    } catch {
      return null;
    }
  }, []);

  /* ------------------------------------------------------------------ prefs */
  const setPref = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updatePrefs = useCallback((patch) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  const setNotificationPref = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
  }, []);

  /* ------------------------------------------------------------------- nav */
  const navigate = useCallback((screen, params = {}) => {
    setNav((prev) => ({ ...prev, screen, params, history: [...prev.history, { screen: prev.screen, params: prev.params }] }));
  }, []);

  const back = useCallback(() => {
    setNav((prev) => {
      if (!prev.history.length) return { ...prev, screen: prev.tab, params: {} };
      const history = [...prev.history];
      const last = history.pop();
      return { ...prev, screen: last.screen, params: last.params, history };
    });
  }, []);

  const setTab = useCallback((tab) => {
    setNav({ tab, screen: tab, params: {}, history: [] });
  }, []);

  const resetTo = useCallback((screen) => {
    setNav((prev) => ({ ...prev, screen, params: {}, history: [] }));
  }, []);

  const theme = useMemo(() => makeTheme(prefs.dark), [prefs.dark]);
  const lang = prefs.lang;
  const t = useCallback((key) => translate(lang, key), [lang]);

  const value = {
    ready,
    booting,
    prefs,
    setPref,
    updatePrefs,
    setNotificationPref,
    theme,
    dark: prefs.dark,
    lang,
    rtl: isRTL(lang),
    t,

    location,
    locStatus,
    locError,
    refreshLocation,
    chooseManual,
    clearLocation,
    manualLocation,
    timezone,
    zone,
    localTime,
    localDate,
    hijri,
    hijriNow,
    inRamadan,

    now,
    times,
    rows,
    next: upcoming,
    formatTime: (date, opts) => formatTime(date, { timeZone: timezone, hour12: prefs.hour12, ...opts }),

    auth,
    user: auth.user,
    token: auth.token,
    signIn,
    signUp,
    signOut,
    refreshUser,
    isAdmin: auth.user?.role === 'admin',

    collections,
    upsert,
    removeItem,
    syncState,
    pullRemote,
    pushRemote,
    syncNow: async () => {
      await pushRemote();
      await pullRemote();
    },
    notifState,

    nav,
    navigate,
    back,
    setTab,
    resetTo,
    onboarded,
    setOnboarded,
    clearAll,
    Platform
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
