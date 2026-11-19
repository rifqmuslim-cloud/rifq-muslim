# RIFQ Muslim — Build instructions

Applies to the shared backend, the Android app, the iOS app and the web build.

## 0. Prerequisites

| Purpose | Tool |
| --- | --- |
| Backend + web build | Node.js 20+ (24 LTS recommended), npm |
| Android APK/AAB | EAS account (`npx eas-cli`) **or** Android Studio + JDK 17 |
| iOS IPA | macOS + Xcode 15+, an Apple Developer account, **or** EAS with Apple credentials |
| Local device testing | Expo Go, or a development build |

```bash
npm install                 # backend
npm --prefix mobile install # app
```

## 1. Backend

```bash
cp .env.example .env        # set JWT_SECRET, optional ADMIN_EMAIL/ADMIN_PASSWORD
npm run server              # http://localhost:3000
npm run check:server        # self test: auth, sync, Quran, geocoding, admin guard
```

Endpoints: `/api/health`, `/api/auth/*`, `/api/data/*`, `/api/content/*`, `/api/quran/*`,
`/api/location/*`, `/api/places/*`, `/api/admin/*`.

## 2. Running the app

```bash
cd mobile
export EXPO_PUBLIC_API_URL=http://192.168.1.10:3000   # your machine, reachable from the phone
npx expo start
```

Press `a` for an Android emulator/device, `i` for the iOS simulator, `w` for the web build.
The device must be able to reach `EXPO_PUBLIC_API_URL`; `localhost` works only for the web build and
emulators.

## 3. Android release

```bash
cd mobile
npx eas-cli login
npx eas-cli build --platform android --profile preview     # APK for testing
npx eas-cli build --platform android --profile production  # signed AAB for Play Store
```

- Application ID: `com.rifqmuslim.app` (set in `app.json`).
- Label, icon, adaptive icon and splash: `app.json` + `assets/`.
- Permissions requested: fine/coarse location, notifications, vibrate, boot-completed (to restore
  prayer alarms), exact alarm.
- Signing: EAS generates and stores the keystore, or supply your own with
  `npx eas-cli credentials`.

Manual Gradle build (no EAS):

```bash
cd mobile
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease     # or bundleRelease for AAB
```

## 4. iOS release

```bash
cd mobile
npx eas-cli build --platform ios --profile production   # requires Apple credentials
```

Manual Xcode build:

```bash
cd mobile
npx expo prebuild --platform ios --clean
open ios/*.xcworkspace
```

- Bundle identifier: `com.rifqmuslim.app`.
- `Info.plist` location/compass usage strings are generated from `app.json` (`NSLocationWhenInUseUsageDescription`,
  `NSMotionUsageDescription`).
- Launch screen: Expo splash configuration in `app.json`.

## 5. Web build (used for review and by the Docker image)

```bash
cd mobile && npx expo export --platform web --output-dir dist
```

The bundle is served by the backend from `server/public` (see `Dockerfile`).

## 6. Docker / production image

```bash
docker build -t rifq-muslim .
docker run -p 3000:3000 -e JWT_SECRET=... -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... rifq-muslim
```

The image builds the web bundle in a first stage and serves it from the API container on port 3000.
`DATA_DIR` defaults to `/app/data`; mount a volume there for durable storage (not included on the
Free hosting plan).

## 7. Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | server | Signs session tokens; required in production |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | server | Creates the first administrator |
| `DATA_DIR` | server | Database location |
| `GEOCODE_PROVIDER` + `GOOGLE_MAPS_API_KEY` / `MAPBOX_TOKEN` | server | Optional commercial geocoding |
| `RESEND_API_KEY`, `RESET_FROM_EMAIL` | server | Password-reset email delivery |
| `EXPO_PUBLIC_API_URL` | app build | API base URL baked into the app |
