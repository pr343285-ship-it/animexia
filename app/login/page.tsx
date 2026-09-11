"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (isRegisterMode) {
        // Register new account through existing ANIMEXIA API
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim() ? name.trim() : undefined,
            email: cleanEmail,
            password: cleanPassword,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Failed to create account. Please try again.");
        }

        // Auto login after successful registration
        const result = await signIn("credentials", {
          email: cleanEmail,
          password: cleanPassword,
          redirect: false,
        });

        if (result?.error) {
          setError("Account created! Please sign in with your password.");
          setIsRegisterMode(false);
          return;
        }

        window.location.href = callbackUrl;
      } else {
        // Sign in with existing credentials
        const result = await signIn("credentials", {
          email: cleanEmail,
          password: cleanPassword,
          redirect: false,
        });

        if (result?.error) {
          if (result.error === "CredentialsSignin") {
            setError("Invalid email or password. Please check your credentials.");
          } else {
            setError(`Authentication failed: ${result.error}`);
          }
        } else {
          window.location.href = callbackUrl;
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    setDemoModalOpen(false);

    try {
      const demoEmail = "demo@animexia.internal";
      const demoPass = "AnimexiaDemo2024!";

      // Check if demo user already exists by trying login
      const res = await signIn("credentials", {
        email: demoEmail,
        password: demoPass,
        redirect: false,
      });

      if (res?.error) {
        // Create demo user in sqlite database if not present
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Demo User", email: demoEmail, password: demoPass }),
        });

        const secondAttempt = await signIn("credentials", {
          email: demoEmail,
          password: demoPass,
          redirect: false,
        });

        if (secondAttempt?.error) {
          throw new Error("Unable to log in with demo account.");
        }
      }

      window.location.href = callbackUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Demo sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Ambient background glows */}
      <div className="login-bg-glow login-bg-glow--primary" />
      <div className="login-bg-glow login-bg-glow--secondary" />

      {/* Back button */}
      <Link href="/" className="login-back-link">
        ← Back to ANIMEXIA
      </Link>

      {/* Glassmorphic Sign In Card */}
      <div className="login-card">
        <div className="login-card__header">
          <Link href="/" className="brand justify-center mb-3" aria-label="ANIMEXIA home">
            <span className="brand__mark">A</span>
            <span className="brand__name">ANIMEXIA<span className="brand__dot">.</span></span>
          </Link>
          <h1>{isRegisterMode ? "Create Account" : "Welcome Back"}</h1>
          <p>{isRegisterMode ? "Register to curate your custom anime queue" : "Sign in to access your cinematic anime watchlist"}</p>
        </div>

        {/* 1-Click Instant Demo Login */}
        <button
          type="button"
          className="google-btn"
          onClick={() => setDemoModalOpen(true)}
        >
          <span className="demo-badge-icon">⚡</span>
          <span>Instant Demo Sign In (1-Click Test)</span>
        </button>

        <div className="login-divider">
          <span>{isRegisterMode ? "or register with credentials" : "or sign in with email"}</span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isRegisterMode && (
            <div className="form-group">
              <label htmlFor="name">Your Name (Optional)</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Rengoku Kyojuro"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (min 8 characters)</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && <div className="login-error" role="alert">{error}</div>}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Please wait..." : isRegisterMode ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="login-card__footer">
          <button
            type="button"
            className="login-toggle-mode"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
          >
            {isRegisterMode
              ? "Already have an account? Sign In"
              : "Don't have an account? Register new account"}
          </button>
        </div>
      </div>

      {/* Transparent Demo Access Modal */}
      {demoModalOpen && (
        <div className="modal-overlay" onClick={() => setDemoModalOpen(false)}>
          <div className="google-auth-box" onClick={(e) => e.stopPropagation()}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>⚡</span>
            <h3>Instant Demo Account</h3>
            <p className="subtext">Pre-configured test profile for quick ANIMEXIA exploration</p>

            <div className="account-item" onClick={handleDemoLogin}>
              <div className="account-avatar">D</div>
              <div className="account-info">
                <div className="account-name">ANIMEXIA Demo Tester</div>
                <div className="account-email">demo@animexia.internal</div>
              </div>
            </div>

            <button
              type="button"
              className="google-modal-cancel"
              onClick={() => setDemoModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-page-container"><div className="login-card"><p className="text-center text-muted">Loading...</p></div></div>}>
      <LoginFormContent />
    </Suspense>
  );
}

