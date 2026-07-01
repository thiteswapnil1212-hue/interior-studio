function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function getInitials(email) {
  const safe = String(email || "").trim();
  if (!safe) return "U";
  const head = safe.split("@")[0] || safe;
  const parts = head.split(/[.\s_-]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => (p[0] || "").toUpperCase())
    .join("");
  return initials || head.slice(0, 2).toUpperCase();
}

function showGlobalAuthError(message) {
  const el = document.getElementById("auth-global-error");
  if (!el) return;
  el.textContent = message || "";
  el.style.display = message ? "block" : "none";
}

function syncVendorLinks(isLoggedIn) {
  const links = Array.from(document.querySelectorAll("[data-vendor-link]"));
  if (!links.length) return;
  const target = isLoggedIn
    ? window.DASHBOARD_URL || "vendor-dashboard.html"
    : window.LOGIN_URL || "login.html";
  links.forEach((link) => {
    if (link.getAttribute("href") !== target) link.setAttribute("href", target);
  });
}

function attachLogout() {
  document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!window.auth) return;
      try {
        await window.auth.signOut();
      } finally {
        window.location.href = window.LOGIN_URL || "login.html";
      }
    });
  });
}

function applyAuthStateToUi(user) {
  const email = user?.email || "";
  const initials = getInitials(email);

  document.querySelectorAll("[data-user-initials]").forEach((el) => {
    setText(el, initials);
    if (email) el.setAttribute("title", email);
  });
  document.querySelectorAll("[data-user-email]").forEach((el) => {
    setText(el, email || "Vendor");
  });
}

function handleAuthRedirects(user) {
  const requiresAuth = document.body?.dataset?.requiresAuth === "true";
  const redirectIfAuth = document.body?.dataset?.redirectIfAuth === "true";

  if (requiresAuth && !user) {
    window.location.href = window.LOGIN_URL || "login.html";
    return;
  }

  if (redirectIfAuth && user) {
    // Only redirect if we aren't already on the dashboard to prevent loops
    const currentPath = window.location.pathname;
    if (!currentPath.includes('vendor-dashboard')) {
      window.location.href = window.DASHBOARD_URL || "vendor-dashboard.html";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  attachLogout();

  const hasFirebase = typeof window.firebase !== "undefined";
  const isConfigured =
    typeof window.isFirebaseConfigured === "function"
      ? window.isFirebaseConfigured()
      : false;

  if (!hasFirebase) {
    syncVendorLinks(false);
    return;
  }

  if (!isConfigured) {
    showGlobalAuthError("Firebase is not configured. Check firebase-init.js.");
    syncVendorLinks(false);
    return;
  }

  if (!window.auth) {
    showGlobalAuthError("Firebase Auth failed to initialize.");
    syncVendorLinks(false);
    return;
  }

  window.auth.onAuthStateChanged((user) => {
    showGlobalAuthError("");
    syncVendorLinks(Boolean(user));
    applyAuthStateToUi(user);
    handleAuthRedirects(user);
  });
});
