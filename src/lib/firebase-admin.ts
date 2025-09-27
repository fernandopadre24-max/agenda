import admin from 'firebase-admin';

// This is a safeguard to prevent re-initialization of the Firebase Admin SDK in Next.js development environment,
// where modules can be re-evaluated on hot reloads.
if (!admin.apps.length) {
  // If the app is not running in a Firebase environment (like App Hosting or Cloud Functions),
  // it will use the service account credentials from the environment variables.
  // GOOGLE_APPLICATION_CREDENTIALS should be set for local development.
  // In Firebase App Hosting, the credentials are automatically available.
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
