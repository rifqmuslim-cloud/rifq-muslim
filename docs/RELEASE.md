# RIFQ Muslim — Release documentation

Branding: **RIFQ Muslim – رِفْق مسلم** · *Your Faith, Your Daily Companion* · Made by **Eng Mohamud Yusuf**

## 1. Identifiers

| Item | Value |
| --- | --- |
| Android application ID | `com.rifqmuslim.app` |
| iOS bundle identifier | `com.rifqmuslim.app` |
| App label / display name | RIFQ Muslim |
| Version | 1.0.0 (Android versionCode 1, iOS buildNumber 1) |
| Deep-link scheme | `rifqmuslim://` |

Change these in `mobile/app.json` before the first store upload if you prefer a different reverse-DNS
name — they cannot be changed after an app is published.

## 2. Assets

| Asset | File | Notes |
| --- | --- | --- |
| App icon (iOS + fallback) | `mobile/assets/icon.png` | 1024×1024, no transparency |
| Android adaptive icon | `mobile/assets/android-icon-foreground.png`, `-background.png`, `-monochrome.png` | emerald background `#0B6E4F` |
| Splash / launch screen | `mobile/assets/splash-icon.png` | centred on emerald `#0B6E4F` |
| Web favicon | `mobile/assets/favicon.png` | |

Replace these files with final brand artwork (keeping the names) and both platforms pick them up on the
next build.

## 3. Permissions declared

**Android** (`app.json` → `android.permissions`): `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`,
`POST_NOTIFICATIONS`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED`, `SCHEDULE_EXACT_ALARM`.

**iOS** (`app.json` → `ios.infoPlist`): `NSLocationWhenInUseUsageDescription`,
`NSLocationAlwaysAndWhenInUseUsageDescription`, `NSMotionUsageDescription`.

The permission dialogs state that location is used for prayer times, the Qibla direction and the Hijri
calendar. Background location is **disabled** on both platforms (foreground refresh only), which keeps
the Play Store data-safety declaration simple and avoids iOS “always allow” justification.

## 4. Store submission checklist

1. `cd mobile && npx eas-cli build --platform all --profile production`
2. Android: upload the `.aab` to Play Console → internal testing → production.
3. iOS: `npx eas-cli submit --platform ios --profile production` (needs Apple ID, App Store Connect
   app ID and team ID in `eas.json`).
4. Data safety / privacy questionnaire:
   - Location: collected **only while using the app**, used for app functionality, not shared with third
     parties except the geocoding provider (coordinates only).
   - Account data: email and optional name, stored on your own backend.
   - No advertising identifiers, no analytics SDKs.
5. Provide a privacy policy URL and a support contact in both stores.

## 5. Signing credentials required (not included in this repository)

| Platform | What you need |
| --- | --- |
| Android | EAS-managed keystore (`eas credentials`) or your own `.jks` + passwords; Play Console account |
| iOS | Apple Developer Program membership, distribution certificate, provisioning profile, App Store Connect app record |

No keystore, certificate, Apple ID or store account is stored here, so **no signed APK/AAB/IPA can be
produced inside this repository**. `docs/BUILD.md` documents the exact commands.

## 6. Production environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | yes | Session signing; sessions end on restart if unset |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | recommended | First administrator for the Admin screen |
| `DATA_DIR` | recommended | Database directory (mount a volume for durability) |
| `GEOCODE_PROVIDER`, `GOOGLE_MAPS_API_KEY`, `MAPBOX_TOKEN` | optional | Higher geocoding limits |
| `RESEND_API_KEY`, `RESET_FROM_EMAIL` | optional | Password-reset email delivery |
| `EXPO_PUBLIC_API_URL` | build-time | API URL baked into the app |

Point `EXPO_PUBLIC_API_URL` at the deployed backend before building release binaries.

## 7. Data durability

The backend stores its JSON database in `DATA_DIR`. AppJet’s Free plan has no persistent disk, so
records can be lost on redeploy. Mount a volume on a paid plan, or run the container yourself, for
durable accounts. Synced data also remains on each device, and the app re-pushes local collections
after a reconnect.
