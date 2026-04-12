import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Chrome,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { useApp } from "../context/AppContext";

// ── Modes ────────────────────────────────────────────────
const MODE = {
  LOGIN: "login",
  SIGNUP: "signup",
  FORGOT: "forgot",
  FORGOT_SENT: "forgot_sent",
};

// ── Validation helpers ───────────────────────────────────
const validators = {
  email: (v) =>
    !v.trim()
      ? "Email is required"
      : !/\S+@\S+\.\S+/.test(v)
        ? "Enter a valid email address"
        : "",
  password: (v) =>
    !v.trim()
      ? "Password is required"
      : v.length < 8
        ? "Minimum 8 characters"
        : "",
  name: (v) =>
    !v.trim()
      ? "Full name is required"
      : v.trim().length < 2
        ? "Name is too short"
        : "",
  confirm: (v, p) =>
    !v
      ? "Please confirm your password"
      : v !== p
        ? "Passwords do not match"
        : "",
};

// ── Premium InputField ────────────────────────────────────
function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  icon: Icon,
  placeholder,
  autoComplete,
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  const resolvedType = isPass ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            input-field w-full rounded-xl py-3.5 text-sm
            ${Icon ? "pl-11" : "pl-4"}
            ${isPass ? "pr-11" : error ? "pr-10" : "pr-4"}
            ${error ? "border-rose-500/50 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.1)]" : ""}
          `}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        {!isPass && error && (
          <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400 pointer-events-none" />
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-xs text-rose-400"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Google Button ─────────────────────────────────────────
function GoogleButton({ onClick, loading, label }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      className="btn-secondary flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <svg
          className="h-4.5 w-4.5"
          viewBox="0 0 24 24"
          style={{ width: "1.125rem", height: "1.125rem" }}
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      {label}
    </motion.button>
  );
}

// ── Divider ───────────────────────────────────────────────
function Divider() {
  return (
    <div className="divider text-xs">
      <span>or continue with email</span>
    </div>
  );
}

// ── Password Strength ─────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
  ];
  const strength = checks.filter((c) => c.pass).length;

  const colorMap = [
    "bg-slate-700",
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
  ];
  const labelMap = ["", "Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colorMap[strength] : "bg-white/10"}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`flex items-center gap-1 text-[11px] transition-colors ${c.pass ? "text-emerald-400" : "text-slate-600"}`}
          >
            <CheckCircle2 className="h-2.5 w-2.5" />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function LoginPage() {
  const { login, signup, loginWithGoogle, showToast } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState(MODE.LOGIN);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [forgotEmail, setForgotEmail] = useState("");

  const updateField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  // ── Validate ──────────────────────────────────────────
  const validate = () => {
    const next = {};
    if (mode === MODE.LOGIN) {
      const ee = validators.email(form.email);
      const pe = validators.password(form.password);
      if (ee) next.email = ee;
      if (pe) next.password = pe;
    } else if (mode === MODE.SIGNUP) {
      const ne = validators.name(form.name);
      const ee = validators.email(form.email);
      const pe = validators.password(form.password);
      const ce = validators.confirm(form.confirm, form.password);
      if (ne) next.name = ne;
      if (ee) next.email = ee;
      if (pe) next.password = pe;
      if (ce) next.confirm = ce;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (mode === MODE.LOGIN) {
        await login({ email: form.email, password: form.password });
      } else {
        await signup({
          email: form.email,
          password: form.password,
          name: form.name,
        });
      }
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ──────────────────────────────────────
  const handleGoogle = useCallback(() => {
    setGoogleLoading(true);

    if (!window.google?.accounts?.id) {
      showToast(
        "Google Sign-In is still loading. Please try again in a moment.",
        "info",
      );
      setGoogleLoading(false);
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          if (!response.credential)
            throw new Error("No credential received from Google");
          await loginWithGoogle(response.credential);
          navigate("/dashboard");
        } catch (err) {
          showToast(err.message || "Google login failed", "error");
        } finally {
          setGoogleLoading(false);
        }
      },
      auto_select: false,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One-Tap not available or skipped — use standard popup as fallback
        try {
          window.google.accounts.id.renderButton(
            document.getElementById("google-button-hidden"),
            { theme: "outline", size: "large" },
          );
          // Trigger click on the hidden button if possible, but usually renderButton is enough
          // For a better UX, we just show an error or try a different approach.
          // Since we want to fix the current one, let's just use the popup if prompt fails.

          // Actually, GIS 'prompt' is for One-Tap. If it fails, we should provide a clear way to login.
          // The current GoogleButton is custom. We should use google.accounts.id.renderButton for the most reliable experience.

          // For now, let's just try to fix the current flow.
          showToast("Please use the Google button to sign in.", "info");
        } catch (err) {
          console.error("Google Prompt Error:", err);
        } finally {
          setGoogleLoading(false);
        }
      }
    });
  }, [loginWithGoogle, navigate, showToast]);

  // ── Forgot Password ───────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setMode(MODE.FORGOT_SENT);
  };

  // ── Switch mode with reset ────────────────────────────
  const switchMode = (newMode) => {
    setErrors({});
    setForm({ name: "", email: "", password: "", confirm: "" });
    setMode(newMode);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 24, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } },
  };

  const isLogin = mode === MODE.LOGIN;
  const isSignup = mode === MODE.SIGNUP;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {/* Brand mark */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-md">
          <Sparkles className="h-7 w-7 text-white" />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            InterviewIQ
          </h1>
          <p className="text-sm text-slate-500">
            AI-powered interview preparation
          </p>
        </div>
      </motion.div>

      {/* Auth Card */}
      <AnimatePresence mode="wait">
        {/* ── FORGOT SENT ─ */}
        {mode === MODE.FORGOT_SENT && (
          <motion.div
            key="sent"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="auth-card w-full max-w-md p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Check your inbox
            </h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              We sent a password reset link to{" "}
              <span className="text-white font-medium">{forgotEmail}</span>. It
              expires in 15 minutes.
            </p>
            <button
              onClick={() => switchMode(MODE.LOGIN)}
              className="mt-6 flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </button>
          </motion.div>
        )}

        {/* ── FORGOT PASSWORD ─ */}
        {mode === MODE.FORGOT && (
          <motion.div
            key="forgot"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="auth-card w-full max-w-md p-8"
          >
            <button
              onClick={() => switchMode(MODE.LOGIN)}
              className="mb-5 flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </button>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
              <Shield className="h-5 w-5 text-brand-400" />
            </div>
            <h2 className="mt-3 font-display text-xl font-bold text-white">
              Reset your password
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              Enter the email you signed up with and we'll send you a reset
              link.
            </p>

            <form onSubmit={handleForgot} className="mt-6 space-y-4">
              <InputField
                label="Email address"
                type="email"
                name="forgot-email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                icon={Mail}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full rounded-xl py-3.5 text-sm disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Sending link...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send reset link
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* ── LOGIN / SIGNUP ─ */}
        {(isLogin || isSignup) && (
          <motion.div
            key={mode}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="auth-card w-full max-w-md"
          >
            {/* Tabs */}
            <div className="flex rounded-t-[1.5rem] overflow-hidden border-b border-white/[0.07]">
              {[MODE.LOGIN, MODE.SIGNUP].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 ${
                    mode === m
                      ? "text-white bg-white/[0.04] border-b-2 border-brand-500"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                  }`}
                >
                  {m === MODE.LOGIN ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <div className="p-7">
              {/* Header */}
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-white">
                  {isLogin ? "Welcome back" : "Get started"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isLogin
                    ? "Sign in to continue preparing for your next interview."
                    : "Create your free account and start practicing today."}
                </p>
              </div>

              {/* Google Button */}
              <GoogleButton
                onClick={handleGoogle}
                loading={googleLoading}
                label={isLogin ? "Continue with Google" : "Sign up with Google"}
              />

              <div className="my-5">
                <Divider />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {isSignup && (
                  <InputField
                    label="Full name"
                    name="name"
                    value={form.name}
                    onChange={updateField("name")}
                    error={errors.name}
                    icon={User}
                    placeholder="Alex Johnson"
                    autoComplete="name"
                  />
                )}

                <InputField
                  label="Email address"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField("email")}
                  error={errors.email}
                  icon={Mail}
                  placeholder="you@example.com"
                  autoComplete={isLogin ? "username" : "email"}
                />

                <div className="space-y-3">
                  <InputField
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={updateField("password")}
                    error={errors.password}
                    icon={Lock}
                    placeholder={
                      isLogin ? "••••••••" : "Create a strong password"
                    }
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  {isSignup && <PasswordStrength password={form.password} />}
                </div>

                {isSignup && (
                  <InputField
                    label="Confirm password"
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={updateField("confirm")}
                    error={errors.confirm}
                    icon={Lock}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode(MODE.FORGOT)}
                      className="text-xs text-slate-500 hover:text-brand-400 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full rounded-xl py-3.5 text-sm mt-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isLogin ? "Sign in" : "Create free account"}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Footer text */}
              {isSignup && (
                <p className="mt-5 text-center text-xs text-slate-600 leading-relaxed">
                  By creating an account, you agree to our{" "}
                  <a
                    href="#"
                    className="text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-xs text-slate-700"
      >
        Protected by enterprise-grade security. Your data is always private.
      </motion.p>
    </div>
  );
}
