# Driver Delivery App

A React Native app for delivery drivers. Features Firebase authentication (email + phone OTP), real-time delivery tracking, route optimisation via OpenRouteService, and push notifications for new delivery assignments.

## Prerequisites

- Node.js >= 18
- React Native CLI (`npx @react-native-community/cli`)
- Xcode (for iOS)
- Android Studio (for Android)
- Firebase project with Auth, Firestore, and FCM enabled
- OpenRouteService API key (free at https://openrouteservice.org/dev/#/signup)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd DriverDeliveryApp
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Add your OpenRouteService API key to `.env`.

3. **Firebase setup**
   - Place `google-services.json` in `android/app/`
   - Place `GoogleService-Info.plist` in `ios/DriverDeliveryApp/`
   - Enable Email/Password and Phone authentication in Firebase Console
   - Create a Firestore database
   - Deploy Firestore security rules: `firebase deploy --only firestore:rules`

4. **Install iOS dependencies**
   ```bash
   cd ios && pod install && cd ..
   ```

5. **Create a test user**
   - In Firebase Console > Authentication > Add User with email and password

## Running

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## Build APK

```bash
cd android
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

## Deploy Cloud Function

```bash
cd functions
npm install
firebase deploy --only functions
```

## Trigger a Test Notification

Add a delivery document in Firestore Console:

**Collection:** `deliveries`

```json
{
  "orderId": "ORD-001",
  "customerName": "John Doe",
  "address": "123 Main St, Toronto, ON",
  "status": "pending",
  "driverId": "<firebase-auth-uid-of-test-user>",
  "location": { "latitude": 43.6532, "longitude": -79.3832 },
  "createdAt": "<server-timestamp>"
}
```

This triggers the Cloud Function, which sends a push notification to the driver's device.

## Project Structure

```
src/
  screens/          # Login, OTP, Deliveries, OptimisedRoute
  navigation/       # Auth-guarded stack navigator
  services/         # OpenRouteService API, notification handling
  components/       # DeliveryCard, StopCard
  hooks/            # useAuth, useDeliveries, useLocation
  config/           # Environment config
functions/          # Firebase Cloud Function for push notifications
```

## Tech Stack

- React Native CLI
- Firebase Auth (email/password + phone OTP)
- Cloud Firestore (real-time data)
- Firebase Cloud Messaging (push notifications)
- Firebase Cloud Functions (Firestore triggers)
- React Navigation (native stack)
- react-native-maps (map display)
- OpenRouteService (route optimisation)
