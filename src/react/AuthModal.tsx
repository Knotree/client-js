import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useKnotree } from "./context.js";
import { Icon } from "./icons.js";
import { appearanceStyle } from "./styles.js";
import { toast } from "./toast.js";
import type { AuthModalProps, AuthView } from "./types.js";
import { isLikelyEmail, passwordStrength } from "./utils.js";

type OtpPending = {
  email: string;
  userId?: string;
  from: "signup" | "signin";
};

function errMsg(error: { message: string } | null | undefined) {
  return error?.message || "Something went wrong. Please try again.";
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function passwordLabel(score: 0 | 1 | 2 | 3 | 4): string {
  if (score === 0) return "Empty";
  if (score === 1) return "Too weak";
  if (score === 2) return "Could be stronger";
  if (score === 3) return "Strong";
  return "Very strong";
}

export function AuthModal({
  open,
  onOpenChange,
  appearance,
  defaultView = "sign-in",
  googleLabel = "Continue with Google",
  onGoogle,
  brandLabel = "Knotree",
}: AuthModalProps) {
  const context = useKnotree();
  const { client } = context;
  const [view, setView] = useState<AuthView>(defaultView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [pending, setPending] = useState<OtpPending | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [showPassword, setShowPassword] = useState({ signin: false, signup: false, reset: false, resetConfirm: false });
  const passwordQuality = useMemo(() => passwordStrength(password), [password]);
  const newPasswordQuality = useMemo(() => passwordStrength(newPassword), [newPassword]);

  useEffect(() => {
    if (open) {
      setView(defaultView);
      setError("");
      setSuccess("");
      setBusy(false);
    }
  }, [defaultView, open]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled),[tabindex]:not([tabindex='-1'])",
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() =>
      dialogRef.current?.querySelector<HTMLElement>("input,button")?.focus(),
    );
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onOpenChange, open]);

  if (!open || typeof document === "undefined") return null;

  const clearNotice = () => {
    setError("");
    setSuccess("");
  };

  const go = (next: AuthView) => {
    clearNotice();
    setView(next);
  };

  const otpCode = otp.join("");

  const setOtpAt = (index: number, raw: string) => {
    const d = digitsOnly(raw);
    if (d.length > 1) {
      // Paste full code
      const chars = d.split("");
      const next = ["", "", "", "", "", ""];
      for (let i = 0; i < 6; i++) next[i] = chars[i] ?? "";
      setOtp(next);
      const focusIdx = Math.min(chars.length, 5);
      otpRefs.current[focusIdx]?.focus();
      return;
    }
    const next = [...otp];
    next[index] = d;
    setOtp(next);
    if (d && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const onOtpKey = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
    if (email && !isLikelyEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    const result = await client.auth.signIn({
      email: email.trim() || undefined,
      username: username.trim() || undefined,
      password,
    });
    setBusy(false);
    if (result.data?.access_token) {
      onOpenChange(false);
      toast.success("Signed in");
      return;
    }
    if (result.error?.code === "EMAIL_NOT_VERIFIED") {
      const details = result.error.details as
        | { user_id?: string; email?: string }
        | undefined;
      const pendingEmail = details?.email || email.trim();
      setPending({
        email: pendingEmail,
        userId: details?.user_id,
        from: "signin",
      });
      setOtp(["", "", "", "", "", ""]);
      setResendIn(30);
      void client.auth.resendEmailOtp({
        email: pendingEmail,
        userId: details?.user_id,
      });
      go("otp");
      return;
    }
    setError(errMsg(result.error));
  };

  const signUp = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
    if (email && !isLikelyEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const result = await client.auth.signUp({
      email: email.trim() || undefined,
      username: username.trim() || undefined,
      password,
    });
    setBusy(false);
    if (result.data?.access_token) {
      onOpenChange(false);
      toast.success("Account created");
      return;
    }
    if (result.data?.status === "pending_verification" || result.data?.user) {
      const user = result.data.user;
      setPending({
        email: user.email || email.trim(),
        userId: user.id,
        from: "signup",
      });
      setOtp(["", "", "", "", "", ""]);
      setResendIn(30);
      go("otp");
      return;
    }
    setError(errMsg(result.error));
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
    if (otpCode.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    const result = await client.auth.verifyEmailOtp({
      code: otpCode,
      email: pending?.email || email,
      userId: pending?.userId,
    });
    setBusy(false);
    if (result.data?.access_token) {
      onOpenChange(false);
      toast.success("Email verified");
      return;
    }
    setError(errMsg(result.error));
  };

  const resendOtp = async () => {
    if (resendIn > 0 || busy) return;
    clearNotice();
    setBusy(true);
    const result = await client.auth.resendEmailOtp({
      email: pending?.email || email,
      userId: pending?.userId,
    });
    setBusy(false);
    if (result.error) setError(errMsg(result.error));
    else {
      setSuccess("A new code is on its way.");
      setResendIn(30);
      toast.info("Code re-sent");
    }
  };

  const forgot = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
    if (email && !isLikelyEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    const result = await client.auth.forgotPassword({ email: email.trim() });
    setBusy(false);
    if (result.error) {
      setError(errMsg(result.error));
      return;
    }
    setPending({ email: email.trim(), from: "signin" });
    setOtp(["", "", "", "", "", ""]);
    setResendIn(30);
    setSuccess("If an account exists, a reset code was sent.");
    go("reset");
  };

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
    if (otpCode.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const result = await client.auth.resetPassword({
      email: pending?.email || email.trim(),
      code: otpCode,
      newPassword,
    });
    setBusy(false);
    if (result.error) {
      setError(errMsg(result.error));
      return;
    }
    setSuccess("Password updated. You can sign in now.");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated");
    go("sign-in");
  };

  const backdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onOpenChange(false);
  };

  const titles: Record<AuthView, [string, string]> = {
    "sign-in": ["Welcome back", "Sign in to continue to your account."],
    "sign-up": ["Create your account", "A 6-digit code will be sent to verify your email."],
    otp: ["Check your email", `Enter the 6-digit code sent to ${pending?.email || "your email"}.`],
    forgot: ["Forgot password", "We'll email a 6-digit code if the account is eligible."],
    reset: ["Reset password", "Enter the code and choose a new password."],
  };
  const [title, subtitle] = titles[view];

  const otpFields = (
    <div className="kt-otp" role="group" aria-label="6-digit verification code">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            otpRefs.current[i] = el;
          }}
          className="kt-otp-input"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={6}
          aria-label={`Digit ${i + 1}`}
          value={digit}
          data-filled={digit.length > 0}
          onChange={(e) => setOtpAt(i, e.target.value)}
          onKeyDown={(e) => onOtpKey(i, e)}
          onPaste={(e) => {
            e.preventDefault();
            setOtpAt(i, e.clipboardData.getData("text"));
          }}
        />
      ))}
    </div>
  );

  return createPortal(
    <div
      className="kt-root kt-backdrop"
      data-mode={appearance?.mode ?? context.appearance?.mode ?? undefined}
      style={appearanceStyle({ ...context.appearance, ...appearance })}
      onMouseDown={backdropClick}
    >
      <div
        ref={dialogRef}
        className="kt-dialog kt-auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="kt-icon-button kt-close"
          aria-label="Close authentication"
          onClick={() => onOpenChange(false)}
        >
          <Icon name="close" width="17" />
        </button>
        <div className="kt-auth-shell">
          {brandLabel ? (
            <div className="kt-auth-banner" aria-hidden="true">
              <span className="kt-auth-banner-mark">
                <span className="kt-brand-mark">K</span>
                {brandLabel}
              </span>
            </div>
          ) : null}
        <div className="kt-auth-body">
          <h2 id={titleId} className="kt-auth-title">
            {title}
          </h2>
          <p className="kt-auth-subtitle">{subtitle}</p>
          {error ? (
            <div className="kt-notice kt-error" role="alert">
              <Icon name="alert" />
              <p>{error}</p>
              <button type="button" className="kt-notice-close" aria-label="Dismiss" onClick={() => setError("")}>
                <Icon name="close" />
              </button>
            </div>
          ) : null}
          {success ? (
            <div className="kt-notice kt-success" role="status">
              <Icon name="check" />
              <p>{success}</p>
              <button type="button" className="kt-notice-close" aria-label="Dismiss" onClick={() => setSuccess("")}>
                <Icon name="close" />
              </button>
            </div>
          ) : null}

          {view === "sign-in" && (
            <form className="kt-auth-form" onSubmit={signIn}>
              <div className="kt-field">
                <label htmlFor="kt-auth-email">Email</label>
                <input
                  id="kt-auth-email"
                  className="kt-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="kt-field">
                <label htmlFor="kt-auth-password">Password</label>
                <div className="kt-input-wrap">
                  <input
                    id="kt-auth-password"
                    className="kt-input"
                    type={showPassword.signin ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="kt-input-action"
                    aria-label={showPassword.signin ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => ({ ...s, signin: !s.signin }))}
                  >
                    <Icon name={showPassword.signin ? "eye-off" : "eye"} />
                  </button>
                </div>
                {password ? (
                  <div className="kt-strength" aria-hidden="true">
                    <div className="kt-strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <span
                          key={level}
                          className="kt-strength-bar"
                          data-level={passwordQuality.score >= level ? level : undefined}
                        />
                      ))}
                    </div>
                    <div className="kt-strength-label">
                      <span>Password strength</span>
                      <strong>{passwordLabel(passwordQuality.score)}</strong>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="kt-auth-links">
                <button type="button" className="kt-text-link" onClick={() => go("forgot")}>
                  Forgot password?
                </button>
              </div>
              <div className="kt-actions kt-auth-actions">
                <button type="submit" className="kt-button kt-primary" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              </div>
              <p className="kt-auth-switch">
                New here?{" "}
                <button type="button" className="kt-text-link" onClick={() => go("sign-up")}>
                  Create an account
                </button>
              </p>
              <div className="kt-divider" aria-hidden="true">or</div>
              {onGoogle ? (
                <button
                  type="button"
                  className="kt-button kt-secondary kt-google"
                  disabled={busy}
                  onClick={() => void onGoogle()}
                >
                  <Icon name="google" />
                  {googleLabel}
                </button>
              ) : (
                <button type="button" className="kt-button kt-secondary kt-google" disabled title="Google sign-in coming soon">
                  <Icon name="google" />
                  {googleLabel}
                </button>
              )}
            </form>
          )}

          {view === "sign-up" && (
            <form className="kt-auth-form" onSubmit={signUp}>
              <div className="kt-field">
                <label htmlFor="kt-auth-signup-email">Email</label>
                <input
                  id="kt-auth-signup-email"
                  className="kt-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="kt-field">
                <label htmlFor="kt-auth-signup-username">Username (optional)</label>
                <input
                  id="kt-auth-signup-username"
                  className="kt-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="kt-field">
                <label htmlFor="kt-auth-signup-password">Password</label>
                <div className="kt-input-wrap">
                  <input
                    id="kt-auth-signup-password"
                    className="kt-input"
                    type={showPassword.signup ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="kt-input-action"
                    aria-label={showPassword.signup ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => ({ ...s, signup: !s.signup }))}
                  >
                    <Icon name={showPassword.signup ? "eye-off" : "eye"} />
                  </button>
                </div>
                {password ? (
                  <div className="kt-strength" aria-hidden="true">
                    <div className="kt-strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <span
                          key={level}
                          className="kt-strength-bar"
                          data-level={passwordQuality.score >= level ? level : undefined}
                        />
                      ))}
                    </div>
                    <div className="kt-strength-label">
                      <span>Password strength</span>
                      <strong>{passwordLabel(passwordQuality.score)}</strong>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="kt-actions kt-auth-actions">
                <button type="submit" className="kt-button kt-primary" disabled={busy}>
                  {busy ? "Creating…" : "Create account"}
                </button>
              </div>
              <p className="kt-auth-switch">
                Already have an account?{" "}
                <button type="button" className="kt-text-link" onClick={() => go("sign-in")}>
                  Sign in
                </button>
              </p>
            </form>
          )}

          {view === "otp" && (
            <form className="kt-auth-form" onSubmit={verifyOtp}>
              {otpFields}
              {pending?.email ? (
                <p className="kt-auth-hint">
                  We sent a 6-digit code to <code>{pending.email}</code>
                </p>
              ) : null}
              <div className="kt-actions kt-auth-actions">
                <button type="submit" className="kt-button kt-primary" disabled={busy || otpCode.length !== 6}>
                  {busy ? "Verifying…" : "Verify email"}
                </button>
              </div>
              <p className="kt-auth-switch">
                <button
                  type="button"
                  className="kt-text-link"
                  disabled={busy || resendIn > 0}
                  onClick={() => void resendOtp()}
                >
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                </button>
              </p>
            </form>
          )}

          {view === "forgot" && (
            <form className="kt-auth-form" onSubmit={forgot}>
              <div className="kt-field">
                <label htmlFor="kt-auth-forgot-email">Email</label>
                <input
                  id="kt-auth-forgot-email"
                  className="kt-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="kt-actions kt-auth-actions">
                <button type="submit" className="kt-button kt-primary" disabled={busy}>
                  {busy ? "Sending…" : "Send reset code"}
                </button>
              </div>
              <p className="kt-auth-switch">
                <button type="button" className="kt-text-link" onClick={() => go("sign-in")}>
                  Back to sign in
                </button>
              </p>
            </form>
          )}

          {view === "reset" && (
            <form className="kt-auth-form" onSubmit={resetPassword}>
              {otpFields}
              <div className="kt-field">
                <label htmlFor="kt-auth-new-password">New password</label>
                <div className="kt-input-wrap">
                  <input
                    id="kt-auth-new-password"
                    className="kt-input"
                    type={showPassword.reset ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="kt-input-action"
                    aria-label={showPassword.reset ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => ({ ...s, reset: !s.reset }))}
                  >
                    <Icon name={showPassword.reset ? "eye-off" : "eye"} />
                  </button>
                </div>
                {newPassword ? (
                  <div className="kt-strength" aria-hidden="true">
                    <div className="kt-strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <span
                          key={level}
                          className="kt-strength-bar"
                          data-level={newPasswordQuality.score >= level ? level : undefined}
                        />
                      ))}
                    </div>
                    <div className="kt-strength-label">
                      <span>Password strength</span>
                      <strong>{passwordLabel(newPasswordQuality.score)}</strong>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="kt-field">
                <label htmlFor="kt-auth-confirm-password">Confirm password</label>
                <div className="kt-input-wrap">
                  <input
                    id="kt-auth-confirm-password"
                    className="kt-input"
                    type={showPassword.resetConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    aria-invalid={confirmPassword.length > 0 && confirmPassword !== newPassword}
                  />
                  <button
                    type="button"
                    className="kt-input-action"
                    aria-label={showPassword.resetConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => ({ ...s, resetConfirm: !s.resetConfirm }))}
                  >
                    <Icon name={showPassword.resetConfirm ? "eye-off" : "eye"} />
                  </button>
                </div>
                {confirmPassword.length > 0 && confirmPassword !== newPassword ? (
                  <span className="kt-field-error">
                    <Icon name="alert" width="12" /> Passwords do not match
                  </span>
                ) : null}
              </div>
              <div className="kt-actions kt-auth-actions">
                <button type="submit" className="kt-button kt-primary" disabled={busy}>
                  {busy ? "Updating…" : "Update password"}
                </button>
              </div>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
