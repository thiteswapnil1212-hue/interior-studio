import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase web config is browser-safe, but it should still come from env
// variables so the project settings are not hardcoded into source control.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Only validate essential keys required for Auth to function
const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length) {
  console.error("CRITICAL: Missing required Firebase environment variables:", missingKeys);
  console.info("Please check your .env file in the project root.");
}

console.log("Firebase config loaded successfully");

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
