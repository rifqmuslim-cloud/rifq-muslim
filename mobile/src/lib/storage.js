/** RIFQ Muslim - local persistence (AsyncStorage on device, localStorage on web). */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'rifq:';

export async function loadJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('[rifq] storage write failed', key, err?.message);
    return false;
  }
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {}
}

export async function clearAll() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((k) => k.startsWith(PREFIX));
    if (mine.length) await AsyncStorage.multiRemove(mine);
  } catch {}
}
