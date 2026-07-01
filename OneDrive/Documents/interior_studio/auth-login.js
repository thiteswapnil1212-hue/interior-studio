function ensureErrorEl(input) {
  if (!input || !input.parentElement) return null;
  let errorEl = input.parentElement.querySelector(".field-error");
  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.className = "field-error";
    errorEl.setAttribute("aria-live", "polite");
    input.parentElement.appendChild(errorEl);
  }
  return errorEl;
}

function clearErrors(form) {
  if (!form) return;
  form.querySelectorAll(".field-error").forEach((el) => {
    el.textContent = "";
    el.style.display = "none";
  });
}

function setFieldError(form, name, message) {
  const input = form?.querySelector(`[name="${name}"]`);
  const errorEl = ensureErrorEl(input);
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.style.display = message ? "block" : "none";
}

function friendlyAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return { field: "email", message: "Please enter a valid email." };
    case "auth/user-not-found":
      return { field: "email", message: "No account found for this email." };
    case "auth/wrong-password":
      return { field: "password", message: "Wrong password. Please try again." };
    case "auth/invalid-credential":
      return { field: "password", message: "Invalid email or password." };
    case "auth/too-many-requests":
      return { field: "password", message: "Too many attempts. Please try again later." };
    case "auth/network-request-failed":
      return { field: "password", message: "Network error. Check your connection and try again." };
    default:
      return { field: "password", message: "Login failed. Please try again." };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors(form);

    // Get elements
    const submitBtn = form.querySelector('button[type="submit"]');
    const authCard = document.querySelector(".auth-card");
    
    if (!submitBtn) return;
    
    // Global instance check
    const firebaseAuth = window.auth || (window.firebase && window.firebase.auth());
    if (!firebaseAuth) {
      setFieldError(form, "email", "Firebase is not ready. Check firebase-init.js.");
      return;
    }

    // Get form data
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");

    if (!email || !password) {
      setFieldError(form, "email", !email ? "Please fill all fields." : "");
      setFieldError(form, "password", !password ? "Please fill all fields." : "");
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.classList.add("loading-state");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Connecting...";
    if (authCard) authCard.classList.add("loading");

    try {
      await firebaseAuth.signInWithEmailAndPassword(email, password);
      window.location.href = window.DASHBOARD_URL || "vendor-dashboard.html";
    } catch (err) {
      // Reset loading state
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading-state");
      submitBtn.textContent = originalText;
      if (authCard) authCard.classList.remove("loading");

      // Handle error
      const code = err && typeof err.code === "string" ? err.code : "";
      const mapped = friendlyAuthError(code);
      setFieldError(form, mapped.field, mapped.message);
      
      // Add shake animation to input field
      const focusEl = form.querySelector(`[name="${mapped.field}"]`);
      if (focusEl) {
        focusEl.classList.add("shake");
        focusEl.focus();
        // Remove shake class after animation
        setTimeout(() => focusEl.classList.remove("shake"), 500);
      }
    }
  });
});
