# RIFQ Muslim — رِفْق مسلم

**Your Faith, Your Daily Companion**
Made by **Eng Mohamud Yusuf**

A real cross-platform Islamic application for **Android and iOS** (React Native / Expo) with a
shared Node backend, shared accounts and synchronized worship data — plus a web build of the same
codebase so the app can be reviewed in a browser.

---

## 1. What is implemented

### Location, GPS, country and timezone engine (worldwide)

| Requirement | Implementation |
| --- | --- |
| Real device GPS | `expo-location` (`getCurrentPositionAsync`, balanced accuracy), no simulated positions |
| Latitude / longitude / accuracy | Stored in the location object and shown on the Home and Location screens |
| City, town, district, region | Reverse geocoding through the backend (`/api/location/reverse`, BigDataCloud + Nominatim) |
| Country + ISO code + flag | Matched against the bundled 250-country dataset (`mobile/src/data/countries.json`) |
| Country capital | Always the dataset capital, displayed separately from the user's own city |
| IANA timezone | `tz-lookup` on the real coordinates (never a country-name lookup), so multi-timezone countries resolve correctly |
| Local date / time / UTC offset / DST | Computed from the IANA zone with `Intl.DateTimeFormat` |
| Travel detection | A background watcher plus app-foreground refresh re-resolve city, country, capital, timezone, prayer times, countdown, notifications and Qibla |
| Permission denied / disabled | Shows **“Location unavailable”** and offers a manual country / city / timezone picker, clearly labelled *manual* |
| Privacy | Permission requested with an explanation, no location history stored, nothing shared publicly |

Somali cities (Mogadishu, Hargeisa, Baidoa, Kismayo, Garowe, Bosaso, Beledweyne, Berbera) are
first-class quick picks; every other country and city is reachable through search.

### Prayer, worship and content

- Prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) from `adhan` using the device coordinates,
  12 calculation methods, Asr madhab and high-latitude rules.
- Next-prayer countdown, monthly timetable, athan + pre-prayer notifications rescheduled after every
  location or date change.
- Ramadan: suhoor/iftar from the same Fajr/Maghrib values, live countdown, 30-day timetable, fasting log.
- Hijri calendar with important dates and per-day prayer times; Qibla compass from the magnetometer.
- Quran: all 114 surahs (Uthmani text + Sahih International translation) served by the backend,
  recitation audio, bookmarks, last-read resume and notes.
- Tasbih counter with haptics and presets; worship tracker (7-day prayer + fasting grid, streaks).
- Duas, hadith, 99 names, knowledge articles, Hajj/Umrah rite checklist, zakat calculator with a real
  nisab threshold, and nearby mosques from OpenStreetMap.
- English, Arabic (RTL) and Somali interfaces; emerald + Islamic gold identity; responsive phone/tablet layouts.

### Accounts and synchronization

Register on Android, sign in on iPhone, and the same profile, bookmarks, reading position, tasbih
records, worship progress, preferences and saved content are there. Auth is JWT based, passwords are
hashed, every collection write is validated server-side, and admin routes re-check the role.

---

## 2. Repository layout

```
server/            Express API + JSON store (auth, data, content, location, admin)
  index.js         app entry, static hosting of the web build
  routes/          auth, data, content, location, admin
  lib/             store, auth helpers, quran source, countries
mobile/            Expo React Native app (Android + iOS + web)
  App.js           providers + splash
  src/Shell.js     tabs, subscreens, RTL
  src/store/       application state, sync, notifications
  src/lib/         location, prayer, hijri, notifications, storage
  src/screens/     22 screens (Home, Prayer, Quran, Worship, Qibla, ... Settings, Admin)
  app.json         Android/iOS ids, permissions, icons, splash
  eas.json         EAS build profiles (APK / AAB / iOS)
docs/              build, testing and release documentation
```

## 3. Quick start (development)

```bash
npm install                 # backend dependencies
npm --prefix mobile install # app dependencies

npm run server              # API on http://localhost:3000
npm --prefix mobile start   # Expo dev server (press a / i / w)
```

Point the app at your backend with `EXPO_PUBLIC_API_URL` (see `.env.example`).

## 4. Environment variables

See [`.env.example`](.env.example). `JWT_SECRET` must be set in production; `ADMIN_EMAIL` /
`ADMIN_PASSWORD` create the first administrator; `DATA_DIR` should point at a mounted volume for a
durable database.

## 5. Documentation

- [`docs/BUILD.md`](docs/BUILD.md) — Android APK/AAB, iOS archive, web export, Docker
- [`docs/TESTING.md`](docs/TESTING.md) — what was tested, how to re-run, known external dependencies
- [`docs/RELEASE.md`](docs/RELEASE.md) — signing credentials, store submission, release checklist

## 6. Honest status

The app code, backend and web build are complete and verified in this repository. **Native APK/AAB/IPA
artifacts cannot be produced here** (no Android SDK/macOS in this environment): build them with EAS or
Xcode using `docs/BUILD.md`. Prayer-time and location accuracy depend on the geocoding provider and the
device GPS; offline use falls back to the nearest known city and says so in the interface.
