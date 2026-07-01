/**
 * Firebase Configuration Module
 * 
 * Centralized configuration for Firebase initialization.
 * These API keys are public for web applications and are safe to expose.
 * Security rules are enforced in the Firebase Console.
 * 
 * NEVER store sensitive secrets (service account keys, admin tokens) in frontend code.
 */

(function () {
  // Application URLs
  window.DASHBOARD_URL = "vendor-dashboard.html";
  window.LOGIN_URL = "login.html";

  // Firebase Configuration
  // These credentials are intended for web applications and are public.
  // Backend security rules in Firestore/Realtime Database enforce access control.
  window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyAJxwigdEqi9L66IUa4f-NijqJIxFMDWEE",
    authDomain: "interior-website-8acb9.firebaseapp.com",
    projectId: "interior-website-8acb9",
    storageBucket: "interior-website-8acb9.firebasestorage.app",
    messagingSenderId: "101748303133",
    appId: "1:101748303133:web:60897b921d571fb0266df4",
    measurementId: "G-VEVRV44JDL",
  };

  /**
   * Validates whether Firebase configuration is properly set up
   * @returns {boolean} True if all required config values are present
   */
  window.isFirebaseConfigured = function isFirebaseConfigured() {
    const config = window.FIREBASE_CONFIG || {};
    return Object.values(config).every(
      (value) => typeof value === "string" && value.trim().length > 0
    );
  };

  /**
   * Initializes Firebase if available
   * This function is called automatically on page load
   */
  if (!window.firebase) {
    window.auth = null;
    console.warn("Firebase SDK not loaded. Check script order in HTML.");
    return;
  }

  // Initialize Firebase only once
  if (window.isFirebaseConfigured() && (!firebase.apps || !firebase.apps.length)) {
    try {
      firebase.initializeApp(window.FIREBASE_CONFIG);
      console.log("✓ Firebase initialized successfully");
    } catch (error) {
      console.error("✗ Firebase initialization failed:", error);
      window.auth = null;
      return;
    }
  }

  // Set the global auth reference if config is valid
  window.auth = window.isFirebaseConfigured() ? firebase.auth() : null;

  if (window.auth) {
    console.log("✓ Firebase Auth is ready");
  }
})();
