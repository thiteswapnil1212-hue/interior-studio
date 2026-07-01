(function () {
  window.DASHBOARD_URL = "vendor-dashboard.html";
  window.LOGIN_URL = "login.html";

  window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyAJxwigdEqi9L66IUa4f-NijqJIxFMDWEE",
    authDomain: "interior-website-8acb9.firebaseapp.com",
    projectId: "interior-website-8acb9",
    storageBucket: "interior-website-8acb9.firebasestorage.app",
    messagingSenderId: "101748303133",
    appId: "1:101748303133:web:60897b921d571fb0266df4",
    measurementId: "G-VEVRV44JDL",
  };

  window.isFirebaseConfigured = function isFirebaseConfigured() {
    const config = window.FIREBASE_CONFIG || {};
    return Object.values(config).every(
      (value) => typeof value === "string" && value.trim().length > 0
    );
  };

  if (!window.firebase) {
    window.auth = null;
    return;
  }

  if (window.isFirebaseConfigured() && (!firebase.apps || !firebase.apps.length)) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
  }

  window.auth = window.isFirebaseConfigured() ? firebase.auth() : null;
})();
