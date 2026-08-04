import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import type { AccountSession, Session } from "../types.js";
import { useKnotree } from "./context.js";
import { Icon } from "./icons.js";
import { appearanceStyle } from "./styles.js";
import { toast } from "./toast.js";
import type { AccountView, UserProfileProps } from "./types.js";
import {
  deviceIconName,
  formatDate,
  formatDateTime,
  initialsOf,
  passwordStrength,
  relativeTime,
} from "./utils.js";

type Notice = { kind: "error" | "success" | "info"; message: string; id: number };

const viewCopy: Record<AccountView, { eyebrow: string; title: string; subtitle: string }> = {
  hub: {
    eyebrow: "Account",
    title: "Welcome back",
    subtitle: "Manage your profile, password, and active sessions.",
  },
  profile: {
    eyebrow: "Profile",
    title: "Personal details",
    subtitle: "These details belong only to this project account.",
  },
  security: {
    eyebrow: "Security",
    title: "Security",
    subtitle: "Update your password to keep your account safe.",
  },
  sessions: {
    eyebrow: "Sessions",
    title: "Active sessions",
    subtitle: "Review and manage the devices where you're signed in.",
  },
};

function displayName(session: Session): string {
  return session.user.username || session.user.email || "Your account";
}

function errMsg(error: { message: string } | null | undefined) {
  return error?.message || "Something went wrong. Please try again.";
}


function passwordLabel(score: 0 | 1 | 2 | 3 | 4): string {
  if (score === 0) return "Strength";
  if (score === 1) return "Too weak";
  if (score === 2) return "Could be stronger";
  if (score === 3) return "Strong";
  return "Very strong";
}

export function UserProfile({
  open,
  onOpenChange,
  defaultView,
  appearance,
  afterSignOut,
}: UserProfileProps) {
  const context = useKnotree();
  const { client, session } = context;
  const [view, setView] = useState<AccountView>(defaultView ?? context.activeView ?? "hub");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [confirm, setConfirm] = useState<{
    mode: "one" | "all" | "others" | "signout";
    displayId?: string;
    device?: string;
  } | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const strength = useMemo(() => passwordStrength(newPassword), [newPassword]);

  useEffect(() => {
    if (open) setView(defaultView ?? context.activeView ?? "hub");
  }, [context.activeView, defaultView, open]);

  useEffect(() => {
    setUsername(session?.user.username ?? "");
    setEmail(session?.user.email ?? "");
    setInitialUsername(session?.user.username ?? "");
    setInitialEmail(session?.user.email ?? "");
  }, [session?.user.email, session?.user.username]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setNotice(null);
    const result = await client.auth.listSessions();
    setSessionsLoading(false);
    if (Array.isArray(result.data)) setSessions(result.data);
    else if (result.error) setNotice({ kind: "error", message: errMsg(result.error), id: Date.now() });
    else setSessions([]);
  }, [client]);

  useEffect(() => {
    // Prefetch sessions when the dialog opens so hub metadata (other devices)
    // is accurate; refresh again when landing on the sessions view.
    if (open) void loadSessions();
  }, [loadSessions, open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled),[tabindex]:not([tabindex='-1']),a[href]",
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
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("button")?.focus());
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onOpenChange, open]);

  const meta = viewCopy[view];
  const otherSessionsCount = sessions.filter((s) => !s.current).length;
  const filteredSessions = useMemo(() => {
    if (!sessionSearch.trim()) return sessions;
    const q = sessionSearch.toLowerCase();
    return sessions.filter(
      (s) =>
        s.device?.toLowerCase().includes(q) ||
        s.application?.toLowerCase().includes(q) ||
        s.network_hint?.toLowerCase().includes(q),
    );
  }, [sessionSearch, sessions]);
  const userName = useMemo(
    () => (session ? displayName(session) : "Your account"),
    [session],
  );
  const initials = useMemo(() => initialsOf(userName), [userName]);
  if (!open || !session || typeof document === "undefined") return null;

  const flash = (kind: Notice["kind"], message: string) => {
    setNotice({ kind, message, id: Date.now() });
    if (kind === "success") toast.success(message);
    if (kind === "error") toast.error(message);
  };

  const clearNotice = () => setNotice(null);

  const selectView = (next: AccountView) => {
    clearNotice();
    setConfirm(null);
    setView(next);
    context.setActiveView(next);
  };

  const profileDirty = username !== initialUsername || email !== initialEmail;

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
    const input: { username?: string; email?: string } = {};
    const nextUsername = username.trim();
    const nextEmail = email.trim();
    if (nextUsername && nextUsername !== (session.user.username ?? "")) input.username = nextUsername;
    if (nextEmail && nextEmail !== (session.user.email ?? "")) input.email = nextEmail;
    if (!input.username && !input.email) {
      flash("info", "Your profile is already up to date.");
      return;
    }
    setBusy("profile");
    const result = await client.auth.updateUser(input);
    setBusy(null);
    if (result.data) {
      flash("success", "Profile updated.");
      setInitialUsername(nextUsername);
      setInitialEmail(nextEmail);
    } else {
      flash("error", errMsg(result.error));
    }
  };

  const resetProfileEdits = () => {
    setUsername(initialUsername);
    setEmail(initialEmail);
    clearNotice();
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearNotice();
    const data = new FormData(event.currentTarget);
    const currentPassword = String(data.get("currentPassword") ?? "");
    if (newPassword.length < 8) {
      flash("error", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      flash("error", "New passwords do not match.");
      return;
    }
    setBusy("password");
    const result = await client.auth.changePassword({ currentPassword, newPassword });
    setBusy(null);
    if (result.data) {
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword({ current: false, next: false, confirm: false });
      onOpenChange(false);
      (afterSignOut ?? context.afterSignOut)?.();
    } else {
      flash("error", errMsg(result.error));
    }
  };

  const signOut = async () => {
    clearNotice();
    setBusy("signout");
    await client.auth.signOut();
    setBusy(null);
    onOpenChange(false);
    (afterSignOut ?? context.afterSignOut)?.();
  };

  const revoke = async (mode: "one" | "others" | "all", displayId?: string) => {
    clearNotice();
    setBusy(`${mode}:${displayId ?? ""}`);
    const result = await client.auth.revokeSessions({ mode, displayId });
    setBusy(null);
    setConfirm(null);
    if (result.error) {
      flash("error", errMsg(result.error));
      return;
    }
    if (mode === "all") {
      onOpenChange(false);
      (afterSignOut ?? context.afterSignOut)?.();
      return;
    }
    const message = mode === "others" ? "Other sessions signed out" : "Session signed out.";
    flash("success", message);
    await loadSessions();
  };

  const backdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onOpenChange(false);
  };


  const nav: Array<{
    key: AccountView;
    icon: "user" | "lock" | "sessions" | "menu";
    label: string;
    badge?: number;
  }> = [
    { key: "hub", icon: "menu", label: "Overview" },
    { key: "profile", icon: "user", label: "Profile" },
    { key: "security", icon: "lock", label: "Security" },
    {
      key: "sessions",
      icon: "sessions",
      label: "Sessions",
      badge: otherSessionsCount > 0 ? otherSessionsCount : undefined,
    },
  ];

  const navigation = nav.map(({ key, icon, label, badge }) => (
    <button
      key={key}
      type="button"
      className="kt-nav-button"
      data-active={view === key}
      aria-current={view === key ? "page" : undefined}
      onClick={() => selectView(key)}
    >
      <Icon name={icon} />
      {label}
      {badge !== undefined ? <span className="kt-nav-badge">{badge}</span> : null}
    </button>
  ));

  return createPortal(
    <div
      className="kt-root kt-backdrop"
      data-mode={appearance?.mode ?? context.appearance?.mode ?? undefined}
      style={appearanceStyle({ ...context.appearance, ...appearance })}
      onMouseDown={backdropClick}
    >
      <div
        ref={dialogRef}
        className="kt-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="kt-icon-button kt-close"
          aria-label="Close account settings"
          onClick={() => onOpenChange(false)}
        >
          <Icon name="close" />
        </button>
        <aside className="kt-sidebar">
          <div className="kt-brand">
            <span className="kt-brand-mark" aria-hidden="true">K</span>
            Account
          </div>
          <div className="kt-account-mini">
            <span className="kt-avatar" aria-hidden="true">{initials}</span>
            <div className="kt-account-copy">
              <div className="kt-account-name" title={userName}>{userName}</div>
              {session.user.email ? (
                <div className="kt-account-email" title={session.user.email}>{session.user.email}</div>
              ) : null}
            </div>
          </div>
          <nav className="kt-nav" aria-label="Account settings">
            {navigation}
          </nav>
          <div className="kt-sidebar-bottom">
            <button
              type="button"
              className="kt-nav-button kt-signout"
              disabled={busy === "signout"}
               onClick={() => setConfirm({ mode: "signout" })}
            >
              <Icon name="logout" />
              {busy === "signout" ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </aside>
        <main className="kt-content">
          <nav className="kt-mobile-head" aria-label="Account settings">
            {navigation}
          </nav>
          <header className="kt-header">
            <div className="kt-header-copy">
              <div className="kt-eyebrow">{meta.eyebrow}</div>
              <h2 className="kt-title" id={titleId}>
                {meta.title}
              </h2>
              <p className="kt-subtitle">{meta.subtitle}</p>
            </div>
          </header>
          {notice ? (
            <div
              className={`kt-notice kt-${notice.kind === "info" ? "info" : notice.kind}`}
              role={notice.kind === "error" ? "alert" : undefined}
              aria-live={notice.kind === "error" ? undefined : "polite"}
            >
              <Icon name={notice.kind === "error" ? "alert" : notice.kind === "success" ? "check" : "info"} />
              <p>{notice.message}</p>
              <button
                type="button"
                className="kt-notice-close"
                aria-label="Dismiss"
                onClick={clearNotice}
              >
                <Icon name="close" />
              </button>
            </div>
          ) : null}
          {view === "hub" && (
            <AccountHub
              session={session}
              otherSessionsCount={otherSessionsCount}
              initials={initials}
              onOpen={selectView}
               onSignOut={() => setConfirm({ mode: "signout" })}
               twoFactorEnabled={twoFactorEnabled}
               onToggleTwoFactor={() => setTwoFactorEnabled((enabled) => !enabled)}
               signingOut={busy === "signout"}
            />
          )}
          {view === "hub" && confirm?.mode === "signout" ? (
            <div className="kt-confirm kt-hub-confirm" role="alertdialog" aria-labelledby={`${titleId}-signout-title`}>
              <div className="kt-confirm-head">
                <span className="kt-confirm-icon" aria-hidden="true"><Icon name="alert" /></span>
                <div>
                  <h4 id={`${titleId}-signout-title`}>Sign out of this device?</h4>
                  <p>You will need to sign in again to access your account.</p>
                </div>
              </div>
              <div className="kt-confirm-actions">
                <button type="button" className="kt-button kt-secondary" onClick={() => setConfirm(null)} disabled={busy !== null}>Cancel</button>
                <button type="button" className="kt-button kt-danger-button" onClick={() => void signOut()} disabled={busy !== null}>
                  {busy === "signout" ? <><Icon name="spinner" className="kt-spin" /> Signing out…</> : "Confirm sign out"}
                </button>
              </div>
            </div>
          ) : null}

          {view === "profile" && (
            <form className="kt-view" onSubmit={(event) => void saveProfile(event)}>
              <section className="kt-section">
                <div className="kt-section-head">
                  <div>
                    <h3 className="kt-section-title">
                      <Icon name="user" /> Personal details
                    </h3>
                    <p className="kt-section-copy">
                      These details belong only to this project account.
                    </p>
                  </div>
                </div>
                <div className="kt-section-body">
                  <div className="kt-form-row">
                    <div className="kt-field">
                      <label htmlFor={`${titleId}-username`}>Username</label>
                      <input
                        className="kt-input"
                        id={`${titleId}-username`}
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. ada-lovelace"
                      />
                    </div>
                    <div className="kt-field">
                      <label htmlFor={`${titleId}-email`}>Email address</label>
                      <input
                        className="kt-input"
                        id={`${titleId}-email`}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <p className="kt-section-copy" style={{ marginTop: 14 }}>
                    <Icon name="calendar" width="12" /> &nbsp;Member since {formatDate(session.user.created_at)}
                  </p>
                  <div className="kt-form-actions">
                    <button
                      type="button"
                      className="kt-button kt-secondary"
                      onClick={resetProfileEdits}
                      disabled={!profileDirty || busy === "profile"}
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="kt-button kt-primary"
                      disabled={!profileDirty || busy === "profile"}
                    >
                      {busy === "profile" ? (
                        <>
                          <Icon name="spinner" className="kt-spin" /> Saving…
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </form>
          )}

          {view === "security" && (
            <form className="kt-view" onSubmit={(event) => void changePassword(event)}>
              <section className="kt-section">
                <div className="kt-section-head">
                  <div>
                    <h3 className="kt-section-title">
                      <Icon name="key" /> Change password
                    </h3>
                    <p className="kt-section-copy">
                      Changing your password signs you out on every device.
                    </p>
                  </div>
                </div>
                <div className="kt-section-body">
                  <div className="kt-form-row">
                    <div className="kt-field">
                      <label htmlFor={`${titleId}-current`}>Current password</label>
                      <div className="kt-input-wrap">
                        <input
                          required
                          className="kt-input"
                          id={`${titleId}-current`}
                          name="currentPassword"
                          type={showPassword.current ? "text" : "password"}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="kt-input-action"
                          aria-label={showPassword.current ? "Hide current password" : "Show current password"}
                          onClick={() =>
                            setShowPassword((s) => ({ ...s, current: !s.current }))
                          }
                        >
                          <Icon name={showPassword.current ? "eye-off" : "eye"} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="kt-grid" style={{ marginTop: 14 }}>
                    <div className="kt-field">
                      <label htmlFor={`${titleId}-new`}>New password</label>
                      <div className="kt-input-wrap">
                        <input
                          required
                          minLength={8}
                          className="kt-input"
                          id={`${titleId}-new`}
                          name="newPassword"
                          type={showPassword.next ? "text" : "password"}
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="kt-input-action"
                          aria-label={showPassword.next ? "Hide new password" : "Show new password"}
                          onClick={() => setShowPassword((s) => ({ ...s, next: !s.next }))}
                        >
                          <Icon name={showPassword.next ? "eye-off" : "eye"} />
                        </button>
                      </div>
                      <div className="kt-strength" aria-hidden="true">
                        <div className="kt-strength-bars">
                          {[1, 2, 3, 4].map((level) => (
                            <span
                              key={level}
                              className="kt-strength-bar"
                              data-level={strength.score >= level ? level : undefined}
                            />
                          ))}
                        </div>
                        <div className="kt-strength-label">
                          <span>Password strength</span>
                          <strong>{passwordLabel(strength.score)}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="kt-field">
                      <label htmlFor={`${titleId}-confirm`}>Confirm new password</label>
                      <div className="kt-input-wrap">
                        <input
                          required
                          minLength={8}
                          className="kt-input"
                          id={`${titleId}-confirm`}
                          name="confirmPassword"
                          type={showPassword.confirm ? "text" : "password"}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          aria-invalid={confirmPassword.length > 0 && confirmPassword !== newPassword}
                        />
                        <button
                          type="button"
                          className="kt-input-action"
                          aria-label={showPassword.confirm ? "Hide confirmation" : "Show confirmation"}
                          onClick={() => setShowPassword((s) => ({ ...s, confirm: !s.confirm }))}
                        >
                          <Icon name={showPassword.confirm ? "eye-off" : "eye"} />
                        </button>
                      </div>
                      {confirmPassword.length > 0 && confirmPassword !== newPassword ? (
                        <span className="kt-field-error">
                          <Icon name="alert" width="12" /> Passwords do not match
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="kt-form-actions">
                    <button
                      type="button"
                      className="kt-button kt-secondary"
                      onClick={() => {
                        setNewPassword("");
                        setConfirmPassword("");
                        setShowPassword({ current: false, next: false, confirm: false });
                        clearNotice();
                      }}
                      disabled={busy === "password"}
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="kt-button kt-primary"
                      disabled={busy === "password"}
                    >
                      {busy === "password" ? (
                        <>
                          <Icon name="spinner" className="kt-spin" /> Updating…
                        </>
                      ) : (
                        "Update password"
                      )}
                    </button>
                  </div>
                </div>
              </section>
              <section className="kt-section">
                <div className="kt-section-head">
                  <div>
                    <h3 className="kt-section-title">
                      <Icon name="shield" /> Extra protection
                    </h3>
                    <p className="kt-section-copy">
                      Add an extra factor at sign-in to keep this account safe.
                    </p>
                  </div>
                </div>
                <div className="kt-section-body">
                  <div className="kt-empty" style={{ borderStyle: "solid" }}>
                    <Icon name="bell" />
                    <strong>Two-factor authentication</strong>
                    <p>Coming soon — you'll be able to require a code at sign-in.</p>
                  </div>
                </div>
              </section>
            </form>
          )}

          {view === "sessions" && (
            <div className="kt-view">
              <section className="kt-section">
                <div className="kt-section-head">
                  <div>
                    <h3 className="kt-section-title">
                      <Icon name="sessions" /> Active sessions
                    </h3>
                    <p className="kt-section-copy">
                      Sign out devices you do not recognise.
                    </p>
                  </div>
                </div>
                <div className="kt-section-body">
                  <div className="kt-sessions-toolbar">
                    <div className="kt-sessions-count">
                      {sessionsLoading
                        ? "Loading…"
                        : `${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
                    </div>
                    <div className="kt-sessions-search">
                      <span className="kt-icon-search" aria-hidden="true">
                        <Icon name="search" />
                      </span>
                      <input
                        type="search"
                        className="kt-input"
                        placeholder="Search device, app, or location"
                        value={sessionSearch}
                        onChange={(e) => setSessionSearch(e.target.value)}
                        aria-label="Search sessions"
                      />
                    </div>
                  </div>
                  <div className="kt-session-list">
                    {sessionsLoading ? (
                      <>
                        <div className="kt-skeleton" />
                        <div className="kt-skeleton" />
                        <div className="kt-skeleton" />
                      </>
                    ) : filteredSessions.length === 0 ? (
                      <div className="kt-empty">
                        <Icon name="sessions" />
                        <strong>No matching sessions</strong>
                        <p>{sessionSearch ? "Try a different search term." : "No active sessions found."}</p>
                      </div>
                    ) : (
                      filteredSessions.map((item) => {
                        const deviceIcon = deviceIconName(item.device);
                        return (
                          <div className="kt-session" key={item.display_id} data-current={item.current}>
                            <span className="kt-session-icon" aria-hidden="true">
                              <Icon name={deviceIcon} />
                            </span>
                            <div className="kt-session-main">
                              <div className="kt-session-name">
                                {item.device || "Unknown device"}
                                {item.current ? <span className="kt-current">Current</span> : null}
                              </div>
                              <div className="kt-session-meta">
                                {item.application ? (
                                  <span className="kt-session-meta-item">
                                    <Icon name="globe" /> {item.application}
                                  </span>
                                ) : null}
                                <span className="kt-session-meta-item">
                                  <Icon name="clock" /> Active {relativeTime(item.last_active_at)}
                                </span>
                                {item.network_hint ? (
                                  <span className="kt-session-meta-item">
                                    <Icon name="map-pin" /> {item.network_hint}
                                  </span>
                                ) : null}
                                <span
                                  className="kt-session-meta-item"
                                  title={formatDateTime(item.last_active_at)}
                                >
                                  Signed in {formatDate(item.signed_in_at)}
                                </span>
                              </div>
                            </div>
                            <div className="kt-session-actions">
                              {!item.current ? (
                                <button
                                  type="button"
                                  className="kt-link-button"
                                  disabled={busy !== null}
                                  onClick={() =>
                                    setConfirm({ mode: "one", displayId: item.display_id, device: item.device })
                                  }
                                >
                                  Sign out
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
              <section className="kt-section">
                <div className="kt-section-head">
                  <div>
                    <h3 className="kt-section-title">
                      <Icon name="shield" /> Session controls
                    </h3>
                    <p className="kt-section-copy">
                      You can sign out other devices or end every active session.
                    </p>
                  </div>
                </div>
                <div className="kt-section-body">
                  <div className="kt-actions kt-actions-start kt-actions-stretch">
                    <button
                      type="button"
                      className="kt-button kt-secondary"
                      onClick={() => setConfirm({ mode: "others" })}
                      disabled={otherSessionsCount === 0 || busy !== null}
                    >
                      <Icon name="logout" /> Sign out other devices
                    </button>
                    <button
                      type="button"
                      className="kt-button kt-danger-button"
                      onClick={() => setConfirm({ mode: "all" })}
                      disabled={busy !== null}
                    >
                      <Icon name="trash" /> Sign out everywhere
                    </button>
                  </div>
                  {confirm ? (
                    <div className="kt-confirm" role="alertdialog" aria-labelledby={`${titleId}-confirm-title`}>
                      <div className="kt-confirm-head">
                        <span className="kt-confirm-icon" aria-hidden="true">
                          <Icon name="alert" />
                        </span>
                        <div>
                          <h4 id={`${titleId}-confirm-title`}>
                            {confirm.mode === "signout"
                              ? "Sign out of this device?"
                              : confirm.mode === "all"
                              ? "Sign out everywhere?"
                              : confirm.mode === "others"
                                ? "Sign out other devices?"
                                : `Sign out ${confirm.device || "this device"}?`}
                          </h4>
                          <p>
                             {confirm.mode === "signout"
                               ? "You will need to sign in again to access your account."
                               : confirm.mode === "all"
                              ? "This also ends the session on this device."
                              : "Your current session will remain active."}
                          </p>
                        </div>
                      </div>
                      <div className="kt-confirm-actions">
                        <button
                          type="button"
                          className="kt-button kt-secondary"
                          onClick={() => setConfirm(null)}
                          disabled={busy !== null}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="kt-button kt-danger-button"
                          disabled={busy !== null}
                           onClick={() =>
                             void (confirm.mode === "signout"
                               ? signOut()
                               : revoke(confirm.mode, confirm.displayId))
                           }
                        >
                           {busy && busy.startsWith(confirm.mode) ? (
                            <>
                              <Icon name="spinner" className="kt-spin" /> Working…
                            </>
                          ) : (
                            "Confirm sign out"
                          )}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>,
    document.body,
  );
}

function AccountHub({
  session,
  otherSessionsCount,
  initials,
  onOpen,
  onSignOut,
  twoFactorEnabled,
  onToggleTwoFactor,
  signingOut,
}: {
  session: Session;
  otherSessionsCount: number;
  initials: string;
  onOpen: (view: AccountView) => void;
  onSignOut: () => void;
  twoFactorEnabled: boolean;
  onToggleTwoFactor: () => void;
  signingOut: boolean;
}) {
  const name = displayName(session);
  return (
    <div className="kt-view kt-account-home">
      <section className="kt-summary" aria-labelledby="account-summary-title">
        <div className="kt-summary-identity">
          <span className="kt-avatar kt-avatar-lg" aria-hidden="true">{initials}</span>
          <div className="kt-summary-copy">
            <div className="kt-summary-name" id="account-summary-title" title={name}>
              {name}
              <span className="kt-badge">{session.user.email_verified ? "Verified" : "Member"}</span>
            </div>
            {session.user.email ? (
              <div className="kt-summary-email" title={session.user.email}>{session.user.email}</div>
            ) : null}
          </div>
        </div>
        <div className="kt-summary-divider" />
        <div className="kt-summary-meta">
          <div><span>Joined</span><strong>{formatDate(session.user.created_at)}</strong></div>
          <div><span>Other devices</span><strong>{otherSessionsCount}</strong></div>
          <div><span>Last sign-in</span><strong>{session.user.last_sign_in_at ? relativeTime(session.user.last_sign_in_at) : "First time"}</strong></div>
        </div>
      </section>
      <section className="kt-action-list" aria-label="Account actions">
        <button type="button" className="kt-action-row" onClick={() => onOpen("profile")}>
          <span className="kt-action-icon" aria-hidden="true"><Icon name="user" /></span>
          <span className="kt-action-copy"><strong>Edit profile</strong><span>Update your name, email, and public details.</span></span>
          <Icon name="chevron" className="kt-action-chevron" />
        </button>
        <button type="button" className="kt-action-row" onClick={() => onOpen("security")}>
          <span className="kt-action-icon" aria-hidden="true"><Icon name="lock" /></span>
          <span className="kt-action-copy"><strong>Password &amp; security</strong><span>Change your password and protect your account.</span></span>
          <span className="kt-action-status">Password set</span>
        </button>
        <button type="button" className="kt-action-row" onClick={() => onOpen("sessions")}>
          <span className="kt-action-icon" aria-hidden="true"><Icon name="sessions" /></span>
          <span className="kt-action-copy"><strong>Active sessions</strong><span>Review and revoke devices where you are signed in.</span></span>
          <span className="kt-action-status">{otherSessionsCount} other</span>
        </button>
        <button
          type="button"
          className="kt-action-row"
          role="switch"
          aria-checked={twoFactorEnabled}
          aria-label="Two-factor authentication"
          onClick={onToggleTwoFactor}
        >
          <span className="kt-action-icon" aria-hidden="true"><Icon name="shield" /></span>
          <span className="kt-action-copy"><strong>Two-factor authentication</strong><span>Require a second step at sign-in.</span></span>
          <span className="kt-switch" data-checked={twoFactorEnabled} aria-hidden="true"><span /></span>
        </button>
      </section>
      <section className="kt-signout-section">
        <div><strong>Sign out</strong><span>End this session on the current device.</span></div>
        <button type="button" className="kt-button kt-signout-button" onClick={onSignOut} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button>
      </section>
    </div>
  );
}
