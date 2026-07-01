import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function mapSignupError(code) {
  switch (code) {
    case "auth/invalid-email":
      return { field: "email", message: "Please enter a valid email address." };
    case "auth/email-already-in-use":
      return {
        field: "email",
        message: "This email already has an account. Try logging in instead.",
      };
    case "auth/weak-password":
      return {
        field: "password",
        message: "Password should be at least 6 characters long.",
      };
    case "auth/network-request-failed":
      return {
        field: "form",
        message: "Network error. Check your connection and try again.",
      };
    default:
      return {
        field: "form",
        message: "Signup failed. Please try again.",
      };
  }
}

export default function SignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Sign Up - Interior Studio Pune";
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

    const nextErrors = {
      email: "",
      password: "",
      form: "",
    };

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password should be at least 6 characters long.";
    }

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({
      email: "",
      password: "",
      form: "",
    });

    try {
      await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const mappedError = mapSignupError(error?.code);

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
                <Link to="/login" className="auth-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="active auth-link">
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
            <p className="auth-kicker">Join As A Partner</p>
            <h1 className="auth-heading">Create your vendor account.</h1>
            <p className="auth-subtitle">
              Sign up once, then log in anytime to access your dashboard.
            </p>
            <div className="auth-highlights" aria-hidden="true">
              <div className="auth-pill">Email + Password</div>
              <div className="auth-pill">Reusable Components</div>
              <div className="auth-pill">Single Page App</div>
            </div>
          </div>

          <div className={`auth-card${isSubmitting ? " loading" : ""}`}>
            <h2 className="auth-title">Sign Up</h2>
            <p className="auth-help">Fill details to create your account.</p>

            {errors.form ? (
              <p className="field-error" aria-live="polite">
                {errors.form}
              </p>
            ) : null}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="signup-email">Email *</label>
                <input
                  id="signup-email"
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
                <label htmlFor="signup-password">Password *</label>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
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
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </button>
                <Link className="secondary-btn btn-inline" to="/login">
                  Already have an account?
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
