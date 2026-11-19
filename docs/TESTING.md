# RIFQ Muslim — Testing report

Everything below was exercised in this repository. Native installable artifacts (APK/AAB/IPA) could
not be compiled here — there is no Android SDK or macOS in this environment — so on-device behaviour
is listed under *not verifiable here* with the exact way to check it.

## 1. Automated checks in the repository

| Check | Command | Covers |
| --- | --- | --- |
| Backend self-test | `npm run check:server` | health, register, duplicate/weak-password rejection, login from a second device, profile read/update, auth guard on `/api/data`, collection push/pull, version-conflict (409), unknown-collection rejection, 114 surahs, surah text, country dataset, reverse geocoding, admin protection, password change, account deletion |
| Web export | `cd mobile && npx expo export --platform web` | the whole React Native tree (22 screens, navigation, context, libraries) compiles and bundles |
| Dependency scan | AppJet security preset | advisories for `package.json` / lockfiles in the repo |

## 2. Location, GPS and timezone

| Scenario | Expected | How verified |
| --- | --- | --- |
| GPS granted, city is not the capital | current city, region, country, capital shown separately | Location screen + Home card render distinct `city` and `capital` fields; backend geocoding checked for Mogadishu (`2.0469, 45.3182`) |
| Country with several timezones | IANA zone from coordinates | `tz-lookup` on lat/lon (`mobile/src/lib/location.js`), not country name |
| Somalia | Africa/Mogadishu, capital Mogadishu | quick picks for Mogadishu, Hargeisa, Baidoa, Kismayo, Garowe, Bosaso, Beledweyne, Berbera |
| Permission denied / GPS off | “Location unavailable” + manual picker | `locStatus` states `denied`/`unavailable`; manual path sets `mode: 'manual'` and is labelled manual in UI |
| Manual selection | country → city → timezone, clearly labelled | `manualCityOption` / `chooseManual` |
| Travel | city, country, capital, timezone, prayer times, countdown, notifications, Qibla all refresh | location watcher + foreground refresh in `AppContext`, notifications rescheduled in `notify.js` |
| Offline | nearest known city used with a visible note | `resolveLocation` fallback sets `provider`/`note`, shown on Home and Location |
| DST / midnight | local clock and date from the IANA zone | `Intl.DateTimeFormat` with `timeZone`; countdown recomputed every second |

**To verify on hardware:** install the app, allow location, then change the device location
(emulator extended controls → Location, or Xcode simulator → Features → Location) to Hargeisa,
Istanbul, London and New York. The Home card must change city, country, capital, timezone, clock and
all six prayer times each time.

## 3. Prayer times, Ramadan and notifications

- Six times computed with `adhan` from the real coordinates; the same function feeds the Home card,
  Prayer screen, countdown, calendar day view, Ramadan suhoor/iftar and notifications.
- Calculation method, Asr madhab and high-latitude rule are user-selectable and persisted.
- Notification scheduling requests permission, cancels stale alarms and reschedules on every change.
- Ramadan screen derives suhoor = Fajr and iftar = Maghrib for the same location and date.

**To verify on hardware:** grant notification permission, confirm five scheduled alarms appear in
the device notification settings, and that changing the location reschedules them.

## 4. Accounts and synchronization

`npm run check:server` proves server-side behaviour: a token issued at registration works for a
second login (the “register on Android, sign in on iPhone” path), collections round-trip, stale
writes return 409 instead of silently overwriting, and admin routes reject normal users.

**To verify on hardware:** register on one platform, sign in on the other, bookmark an ayah on the
first and confirm it appears on the second after a sync.

## 5. Not verifiable in this environment

| Item | Why | How to verify |
| --- | --- | --- |
| APK/AAB/IPA artifacts | no Android SDK / macOS / signing credentials | `docs/BUILD.md` §3–4 |
| Real GPS, magnetometer compass, native notifications | no physical device or emulator here | run the app via Expo and follow §2–3 |
| App Store / Play submission | requires developer accounts | `docs/RELEASE.md` |
| Commercial geocoding limits | default providers are free-tier (BigDataCloud, Nominatim) | set `GEOCODE_PROVIDER` + key |

## 6. Known external dependencies

- Reverse geocoding: BigDataCloud and OpenStreetMap Nominatim (free, rate-limited), optional Google
  Maps or Mapbox with a key.
- Nearby mosques: OpenStreetMap Overpass API.
- Quran text/translation and recitation audio: fetched by the backend from the configured source and
  cached; requires network on first use.
- Password-reset email: only delivered when `RESEND_API_KEY` is configured; otherwise the code is
  returned to the caller and marked `delivery: not_configured`.
