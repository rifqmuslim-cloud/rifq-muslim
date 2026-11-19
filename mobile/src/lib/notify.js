/**
 * RIFQ Muslim - prayer notifications (Android + iOS local notifications).
 *
 * Notifications are scheduled from the *computed* prayer times for the detected
 * coordinates and timezone, one concrete trigger per prayer per day, then
 * rescheduled whenever the location, calculation method or settings change.
 * Web builds cannot schedule native notifications; the app says so instead of
 * pretending they were set.
 */
import { Platform } from 'react-native';
import { computePrayerTimes, PRAYER_KEYS } from './prayer';

let Notifications = null;
function lib() {
  if (Platform.OS === 'web') return null;
  if (!Notifications) {
    // Loaded lazily so the web bundle never imports the native module.
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false
      })
    });
  }
  return Notifications;
}

export const NOTIFICATIONS_SUPPORTED = Platform.OS !== 'web';

export async function ensurePermissions() {
  const N = lib();
  if (!N) return { granted: false, reason: 'Native notifications are not available in the web build.' };
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('prayer', {
      name: 'Prayer times',
      importance: N.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC
    });
    await N.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: N.AndroidImportance.DEFAULT,
      sound: 'default'
    });
  }
  const current = await N.getPermissionsAsync();
  if (current.granted) return { granted: true };
  const asked = await N.requestPermissionsAsync();
  if (!asked.granted) {
    return { granted: false, reason: 'Notification permission was denied. Enable it in your device settings to receive prayer alerts.' };
  }
  return { granted: true };
}

export async function cancelAll() {
  const N = lib();
  if (!N) return;
  const scheduled = await N.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => String(item.identifier || '').startsWith('rifq-'))
      .map((item) => N.cancelScheduledNotificationAsync(item.identifier))
  );
}

/**
 * Schedule the next `days` of prayer notifications.
 * prefs.notifications = { enabled, fajr:true, dhuhr:true, ..., preMinutes }
 */
export async function schedulePrayerNotifications({ latitude, longitude, prefs, days = 7, lang = 'en' }) {
  const N = lib();
  if (!N) return { scheduled: 0, supported: false };
  const settings = prefs.notifications || {};
  if (!settings.enabled) {
    await cancelAll();
    return { scheduled: 0, supported: true, disabled: true };
  }
  const permission = await ensurePermissions();
  if (!permission.granted) return { scheduled: 0, supported: true, error: permission.reason };

  await cancelAll();
  const lead = Math.max(0, Math.min(60, Number(settings.preMinutes) || 0));
  let scheduled = 0;
  const now = Date.now();

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const date = new Date(now + dayOffset * 86400000);
    const times = computePrayerTimes({ latitude, longitude, date, prefs });
    if (!times) continue;
    for (const key of PRAYER_KEYS) {
      if (key === 'sunrise') continue;
      if (settings[key] === false) continue;
      const when = new Date(times[key].getTime() - lead * 60000);
      if (when.getTime() <= now + 30000) continue;
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      try {
        await N.scheduleNotificationAsync({
          identifier: `rifq-${key}-${when.getTime()}`,
          content: {
            title: `${label} - RIFQ Muslim`,
            body:
              lead > 0
                ? `${label} begins in ${lead} minutes at your current location.`
                : `It is time for ${label} at your current location.`,
            sound: 'default',
            data: { prayer: key, at: when.toISOString() },
            ...(Platform.OS === 'android' ? { channelId: 'prayer' } : {})
          },
          trigger: { type: N.SchedulableTriggerInputTypes?.DATE || 'date', date: when }
        });
        scheduled += 1;
      } catch (err) {
        console.warn('[rifq] notification schedule failed', err?.message);
      }
    }
  }
  return { scheduled, supported: true };
}

export async function scheduledCount() {
  const N = lib();
  if (!N) return 0;
  const all = await N.getAllScheduledNotificationsAsync();
  return all.filter((item) => String(item.identifier || '').startsWith('rifq-')).length;
}

export async function scheduleReminder({ title, body, date, id }) {
  const N = lib();
  if (!N) return { supported: false };
  const permission = await ensurePermissions();
  if (!permission.granted) return { supported: true, error: permission.reason };
  await N.scheduleNotificationAsync({
    identifier: `rifq-reminder-${id}`,
    content: { title, body, sound: 'default', ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}) },
    trigger: { type: N.SchedulableTriggerInputTypes?.DATE || 'date', date },
  });
  return { supported: true, ok: true };
}
