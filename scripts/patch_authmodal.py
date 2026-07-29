#!/usr/bin/env python3
"""Patch AuthModal.tsx to add the new UI/UX features."""
import sys

path = r"D:\code\tinybase\client-js\src\react\AuthModal.tsx"
with open(path, "rb") as f:
    raw = f.read()

nl_b = b"\r\n" if b"\r\n" in raw else b"\n"
nl = nl_b.decode("ascii")
src = raw.decode("utf-8")
print("Using line ending:", repr(nl))

def fix(s):
    """Replace CRLF/LF with the actual line ending in a string."""
    # Normalize to LF first, then to target
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    return s.replace("\n", nl)


# 1) Update imports
old_imports = fix("""import {
  useEffect,
  useId,
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
import type { AuthModalProps, AuthView } from "./types.js";""")
new_imports = fix("""import {
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
import { isLikelyEmail, passwordStrength } from "./utils.js";""")
assert old_imports in src, "imports not found"
src = src.replace(old_imports, new_imports)
print("1 imports done")

# 2) Add passwordLabel after digitsOnly
src = src.replace(
    fix("function digitsOnly(value: string) {\n  return value.replace(/\\D/g, \"\").slice(0, 6);\n}\n"),
    fix("function digitsOnly(value: string) {\n  return value.replace(/\\D/g, \"\").slice(0, 6);\n}\n\nfunction passwordLabel(score: 0 | 1 | 2 | 3 | 4): string {\n  if (score === 0) return \"Empty\";\n  if (score === 1) return \"Too weak\";\n  if (score === 2) return \"Could be stronger\";\n  if (score === 3) return \"Strong\";\n  return \"Very strong\";\n}\n"),
)
print("2 passwordLabel done")

# 3) Add brandLabel to the props
old_props = fix("""export function AuthModal({
  open,
  onOpenChange,
  appearance,
  defaultView = "sign-in",
  googleLabel = "Continue with Google",
  onGoogle,
}: AuthModalProps) {""")
new_props = fix("""export function AuthModal({
  open,
  onOpenChange,
  appearance,
  defaultView = "sign-in",
  googleLabel = "Continue with Google",
  onGoogle,
  brandLabel = "Knotree",
}: AuthModalProps) {""")
assert old_props in src, "AuthModal props not found"
src = src.replace(old_props, new_props)
print("3 brandLabel done")

# 4) Add showPassword and strength memos
old_state = fix("  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);\r\n")
new_state = (
    fix("  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);\r\n")
    + "  const [showPassword, setShowPassword] = useState({ signin: false, signup: false, reset: false, resetConfirm: false });\r\n"
    + "  const passwordQuality = useMemo(() => passwordStrength(password), [password]);\r\n"
    + "  const newPasswordQuality = useMemo(() => passwordStrength(newPassword), [newPassword]);\r\n"
)
assert old_state in src, "otpRefs state not found"
src = src.replace(old_state, new_state)
print("4 state done")
print("len src after step 4:", len(src))
print("len raw:", len(raw))
print("'otpRefs' in src:", "otpRefs" in src)
print("'  const otpRefs' in src:", "  const otpRefs" in src)
if "  const otpRefs" in src:
    idx = src.find("  const otpRefs")
    print("after '  const otpRefs':", repr(src[idx:idx+100]))
print("old_state:", repr(old_state))
print("old_state in src:", old_state in src)

# 5) Replace the backdrop opening to add data-mode + auth shell with banner
old_backdrop = fix("""    <div
      className="kt-root kt-backdrop"
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
        <div className="kt-auth-body">""")
new_backdrop = fix("""    <div
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
        <div className="kt-auth-body">""")
assert old_backdrop in src, "backdrop not found"
src = src.replace(old_backdrop, new_backdrop)
print("5 backdrop done")

# 6) Close the auth-shell with extra </div>
old_close = fix("""        </div>
      </div>
    </div>,
    document.body,
  );
}
""")
new_close = fix("""        </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
""")
idx = src.rfind(old_close)
if idx < 0:
    print("Closing not found", file=sys.stderr)
    sys.exit(1)
src = src[:idx] + new_close + src[idx + len(old_close):]
print("6 closing done")

# 7) Auth notices with icon and dismiss
old_notice = fix("""          {error ? <div className="kt-notice kt-error">{error}</div> : null}
          {success ? <div className="kt-notice kt-success">{success}</div> : null}""")
new_notice = fix("""          {error ? (
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
          ) : null}""")
assert old_notice in src, "notice block not found"
src = src.replace(old_notice, new_notice)
print("7 notice done")

# 8) Auth title and subtitle
old_h = fix("""          <h2 id={titleId} className="kt-title">
            {title}
          </h2>
          <p className="kt-subtitle">{subtitle}</p>""")
new_h = fix("""          <h2 id={titleId} className="kt-auth-title">
            {title}
          </h2>
          <p className="kt-auth-subtitle">{subtitle}</p>""")
assert old_h in src, "h2 block not found"
src = src.replace(old_h, new_h)
print("8 h2 done")

# 9) Update titles dictionary
old_titles = '    "sign-up": ["Create account", "A verification code will be sent to your email."],'
new_titles = '    "sign-up": ["Create your account", "A 6-digit code will be sent to verify your email."],'
if old_titles in src:
    src = src.replace(old_titles, new_titles)
print("9 titles done")

# 10) Add divider + Google icon
old_google_simple = fix("""              {onGoogle ? (
                <button
                  type="button"
                  className="kt-button kt-secondary kt-google"
                  disabled={busy}
                  onClick={() => void onGoogle()}
                >
                  {googleLabel}
                </button>
              ) : (
                <button type="button" className="kt-button kt-secondary kt-google" disabled title="Google sign-in coming soon">
                  {googleLabel}
                </button>
              )}""")
new_google_simple = fix("""              <div className="kt-divider" aria-hidden="true">or</div>
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
              )}""")
assert old_google_simple in src, "google button not found"
src = src.replace(old_google_simple, new_google_simple)
print("10 google done")

# 11) Add show/hide to sign-in password
old_signin_pw = fix("""              <div className="kt-field">
                <label htmlFor="kt-auth-password">Password</label>
                <input
                  id="kt-auth-password"
                  className="kt-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>""")
new_signin_pw = fix("""              <div className="kt-field">
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
              </div>""")
assert old_signin_pw in src, "signin password not found"
src = src.replace(old_signin_pw, new_signin_pw)
print("11 signin pw done")

# 12) Sign-up password field
old_signup_pw = fix("""              <div className="kt-field">
                <label htmlFor="kt-auth-signup-password">Password</label>
                <input
                  id="kt-auth-signup-password"
                  className="kt-input"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>""")
new_signup_pw = fix("""              <div className="kt-field">
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
              </div>""")
assert old_signup_pw in src, "signup password not found"
src = src.replace(old_signup_pw, new_signup_pw)
print("12 signup pw done")

# 13) Reset password fields
old_reset_pw = fix("""              <div className="kt-field">
                <label htmlFor="kt-auth-new-password">New password</label>
                <input
                  id="kt-auth-new-password"
                  className="kt-input"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="kt-field">
                <label htmlFor="kt-auth-confirm-password">Confirm password</label>
                <input
                  id="kt-auth-confirm-password"
                  className="kt-input"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>""")
new_reset_pw = fix("""              <div className="kt-field">
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
              </div>""")
assert old_reset_pw in src, "reset password not found"
src = src.replace(old_reset_pw, new_reset_pw)
print("13 reset pw done")

# 14) Add OTP email hint
old_otp = fix("""          {view === "otp" && (
            <form className="kt-auth-form" onSubmit={verifyOtp}>
              {otpFields}
              <div className="kt-actions kt-auth-actions">""")
new_otp = fix("""          {view === "otp" && (
            <form className="kt-auth-form" onSubmit={verifyOtp}>
              {otpFields}
              {pending?.email ? (
                <p className="kt-auth-hint">
                  We sent a 6-digit code to <code>{pending.email}</code>
                </p>
              ) : null}
              <div className="kt-actions kt-auth-actions">""")
assert old_otp in src, "otp block not found"
src = src.replace(old_otp, new_otp)
print("14 otp done")

# 15) Add data-filled to OTP inputs
old_otp_input = fix("""          value={digit}
          onChange={(e) => setOtpAt(i, e.target.value)}""")
new_otp_input = fix("""          value={digit}
          data-filled={digit.length > 0}
          onChange={(e) => setOtpAt(i, e.target.value)}""")
assert old_otp_input in src, "otp input not found"
src = src.replace(old_otp_input, new_otp_input)
print("15 otp input done")

# 16) Add isLikelyEmail checks and toasts in handlers
old_signin_handler = fix("""  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
    setBusy(true);
    const result = await client.auth.signIn({
      email: email.trim() || undefined,
      username: username.trim() || undefined,
      password,
    });
    setBusy(false);
    if (result.data?.access_token) {
      onOpenChange(false);
      return;
    }
    if (result.error?.code === "EMAIL_NOT_VERIFIED") {""")
new_signin_handler = fix("""  const signIn = async (event: FormEvent) => {
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
    if (result.error?.code === "EMAIL_NOT_VERIFIED") {""")
assert old_signin_handler in src, "signin handler not found"
src = src.replace(old_signin_handler, new_signin_handler)
print("16 signin handler done")

old_signup_handler = fix("""  const signUp = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
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
      return;
    }
    if (result.data?.status === "pending_verification" || result.data?.user) {""")
new_signup_handler = fix("""  const signUp = async (event: FormEvent) => {
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
    if (result.data?.status === "pending_verification" || result.data?.user) {""")
assert old_signup_handler in src, "signup handler not found"
src = src.replace(old_signup_handler, new_signup_handler)
print("17 signup handler done")

# verifyOtp
old_verify = fix("""    if (result.data?.access_token) {
      onOpenChange(false);
      return;
    }
    setError(errMsg(result.error));
  };

  const resendOtp""")
new_verify = fix("""    if (result.data?.access_token) {
      onOpenChange(false);
      toast.success("Email verified");
      return;
    }
    setError(errMsg(result.error));
  };

  const resendOtp""")
assert old_verify in src, "verify handler not found"
src = src.replace(old_verify, new_verify)
print("18 verify handler done")

# resendOtp
old_resend = fix("""    if (result.error) setError(errMsg(result.error));
    else {
      setSuccess("A new code is on its way.");
      setResendIn(30);
    }
  };""")
new_resend = fix("""    if (result.error) setError(errMsg(result.error));
    else {
      setSuccess("A new code is on its way.");
      setResendIn(30);
      toast.info("Code re-sent");
    }
  };""")
assert old_resend in src, "resend handler not found"
src = src.replace(old_resend, new_resend)
print("19 resend handler done")

# forgot
old_forgot = fix("""  const forgot = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
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
  };""")
new_forgot = fix("""  const forgot = async (event: FormEvent) => {
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
  };""")
assert old_forgot in src, "forgot handler not found"
src = src.replace(old_forgot, new_forgot)
print("20 forgot handler done")

# resetPassword
old_reset_handler = fix("""    setSuccess("Password updated. You can sign in now.");
    setPassword("");
    go("sign-in");
  };""")
new_reset_handler = fix("""    setSuccess("Password updated. You can sign in now.");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated");
    go("sign-in");
  };""")
assert old_reset_handler in src, "reset handler not found"
src = src.replace(old_reset_handler, new_reset_handler)
print("21 reset handler done")

with open(path, "wb") as f:
    f.write(src.encode("utf-8"))

print("AuthModal updated successfully")
