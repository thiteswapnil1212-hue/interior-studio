import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const EMPTY_ERRORS = {
  email: "",
  password: "",
  form: "",
};

function validateLogin(values) {
  const nextErrors = {
    email: "",
    password: "",
    form: "",
  };

  if (!values.email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    nextErrors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    nextErrors.password = "Password is required.";
  }

  return nextErrors;
}

function mapLoginError(code) {
  switch (code) {
    case "auth/invalid-email":
      return { field: "email", message: "Please enter a valid email address." };
    case "auth/user-not-found":
      return { field: "email", message: "No account exists for this email." };
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return { field: "password", message: "Invalid email or password." };
    case "auth/too-many-requests":
      return {
        field: "form",
        message: "Too many attempts. Please wait and try again.",
      };
    case "auth/network-request-failed":
      return {
        field: "form",
        message: "Network error. Check your connection and try again.",
      };
    default:
      return {
        field: "form",
        message: "Login failed. Please try again.",
      };
  }
}

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    document.title = "Login - Interior Studio Pune";
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      form: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateLogin(formData);

    if (validationErrors.email || validationErrors.password) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors(EMPTY_ERRORS);

    try {
      await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      // Router navigation replaces the old window.location redirect.
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const mappedError = mapLoginError(error?.code);

      setErrors((current) => ({
        ...current,
        [mappedError.field]: mappedError.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page auth-body">
      <header>
        <nav className="navbar">
          <div className="container">
            <div className="logo">
              <Link className="brand" to="/">
                Interior Studio Pune
              </Link>
            </div>
            <ul className="nav-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/login" className="active auth-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="auth-link">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <main className="auth-main">
        <section className="auth-shell">
          <div className="auth-panel">
            <p className="auth-kicker">Collaborator Portal</p>
            <h1 className="auth-heading">Welcome back.</h1>
            <p className="auth-subtitle">
              Log in to manage products, respond to enquiries, and track your impact.
            </p>
            <div className="auth-highlights" aria-hidden="true">
              <div className="auth-pill">React Router</div>
              <div className="auth-pill">Firebase Auth</div>
              <div className="auth-pill">Protected Routes</div>
            </div>
          </div>

          <div className={`auth-card${isSubmitting ? " loading" : ""}`}>
            <h2 className="auth-title">Login</h2>
            <p className="auth-help">Login with your email and password.</p>

            {errors.form ? (
              <p className="field-error" aria-live="polite">
                {errors.form}
              </p>
            ) : null}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email *</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? (
                  <p className="field-error" aria-live="polite">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password *</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password ? (
                  <p className="field-error" aria-live="polite">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <div className="auth-actions">
                <button
                  type="submit"
                  className="primary-btn btn-borderless"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Connecting..." : "Login"}
                </button>
                <Link className="secondary-btn btn-inline" to="/signup">
                  Create account
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
