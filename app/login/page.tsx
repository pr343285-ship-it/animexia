"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        // Register new account through existing ANIMEXIA API
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create account.");
        }

        // Auto login after registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Account created, please sign in.");
        }

        router.push("/");
        router.refresh();
      } else {
        // Sign in with existing credentials
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password.");
        } else {
          router.push("/");
          router.refresh();
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
    setGoogleModalOpen(false);

    // Simulated 1-click fast login for instant demo experience
    try {
      // First try to register or sign in demo user
      const demoEmail = "demo@animexia.internal";
      const demoPass = "AnimexiaDemo2024!";
      
      const res = await signIn("credentials", {
        email: demoEmail,
        password: demoPass,
        redirect: false,
      });

      if (res?.error) {
        // Create demo user if not yet in sqlite db
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Google User", email: demoEmail, password: demoPass }),
        });

        await signIn("credentials", {
          email: demoEmail,
          password: demoPass,
          redirect: false,
        });
      }

      router.push("/");
      router.refresh();
    } catch {
      // Fallback
      router.push("/");
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
          <p>{isRegisterMode ? "Join ANIMEXIA for curated anime tracking" : "Sign in to access your cinematic anime queue"}</p>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          className="google-btn"
          onClick={() => setGoogleModalOpen(true)}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        <div className="login-divider">
          <span>or continue with email</span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isRegisterMode && (
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Rengoku"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
            <label htmlFor="password">Password</label>
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

          {error && <div className="login-error">{error}</div>}

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
              : "Don't have an account? Join ANIMEXIA"}
          </button>
        </div>
      </div>

      {/* Simulated Google Auth Modal from Downloads project */}
      {googleModalOpen && (
        <div className="modal-overlay" onClick={() => setGoogleModalOpen(false)}>
          <div className="google-auth-box" onClick={(e) => e.stopPropagation()}>
            <svg className="google-icon" style={{ width: 28, height: 28, margin: "0 auto 8px" }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <h3>Choose an account</h3>
            <p className="subtext">to continue to ANIMEXIA</p>

            <div className="account-item" onClick={handleDemoLogin}>
              <div className="account-avatar">G</div>
              <div className="account-info">
                <div className="account-name">Google Demo User</div>
                <div className="account-email">demo@animexia.internal</div>
              </div>
            </div>

            <button
              type="button"
              className="google-modal-cancel"
              onClick={() => setGoogleModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
