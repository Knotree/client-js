import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import type { AccountSession } from "../types.js";
import { useKnotree } from "./context.js";
import { Icon } from "./icons.js";
import { appearanceStyle } from "./styles.js";
import type { AccountView, UserProfileProps } from "./types.js";

const viewCopy: Record<AccountView, [string, string]> = {
  profile: ["Profile", "Manage the details people see when you use this app."],
  security: ["Security", "Update your password and protect access to your account."],
  sessions: ["Sessions", "Review the devices where your account is signed in."],
};

function displayName(username: string | null, email: string | null) {
  return username || email || "Your account";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function message(error: { message: string } | null) {
  return error?.message || "Something went wrong. Please try again.";
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
  const [view, setView] = useState<AccountView>(defaultView ?? context.activeView);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirm, setConfirm] = useState<"all" | "others" | null>(null);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setView(defaultView ?? context.activeView);
  }, [context.activeView, defaultView, open]);

  useEffect(() => {
    setUsername(session?.user.username ?? "");
    setEmail(session?.user.email ?? "");
  }, [session?.user.email, session?.user.username]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setError("");
    const result = await client.auth.listSessions();
    setSessionsLoading(false);
    if (result.data) setSessions(result.data);
    else setError(message(result.error));
  }, [client]);

  useEffect(() => {
    if (open && view === "sessions") void loadSessions();
  }, [loadSessions, open, view]);

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
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("button")?.focus());
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onOpenChange, open]);

  if (!open || !session || typeof document === "undefined") return null;

  const clearNotice = () => {
    setError("");
    setSuccess("");
  };
  const selectView = (next: AccountView) => {
    clearNotice();
    setConfirm(null);
    setView(next);
    context.setActiveView(next);
  };
  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    clearNotice();
    setBusy("profile");
    const result = await client.auth.updateUser({
      username: username.trim(),
      email: email.trim(),
    });
    setBusy(null);
    result.data ? setSuccess("Profile updated.") : setError(message(result.error));
  };
  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearNotice();
    const data = new FormData(event.currentTarget);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    if (newPassword.length < 8) return setError("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("New passwords do not match.");
    setBusy("password");
    const result = await client.auth.changePassword({ currentPassword, newPassword });
    setBusy(null);
    if (result.data) {
      onOpenChange(false);
      (afterSignOut ?? context.afterSignOut)?.();
    } else setError(message(result.error));
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
    if (result.error) return setError(message(result.error));
    if (mode === "all") {
      onOpenChange(false);
      (afterSignOut ?? context.afterSignOut)?.();
    } else {
      setSuccess(mode === "others" ? "Other sessions signed out." : "Session signed out.");
      await loadSessions();
    }
  };
  const backdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onOpenChange(false);
  };
  const userName = displayName(session.user.username, session.user.email);
  const nav: Array<[AccountView, "user" | "lock" | "sessions", string]> = [
    ["profile", "user", "Profile"],
    ["security", "lock", "Security"],
    ["sessions", "sessions", "Sessions"],
  ];

  const navigation = nav.map(([key, icon, label]) => (
    <button
      key={key}
      type="button"
      className="kt-nav-button"
      data-active={view === key}
      aria-current={view === key ? "page" : undefined}
      onClick={() => selectView(key)}
    >
      <Icon name={icon} />{label}
    </button>
  ));

  return createPortal(
    <div className="kt-root kt-backdrop" style={appearanceStyle({ ...context.appearance, ...appearance })} onMouseDown={backdropClick}>
      <div ref={dialogRef} className="kt-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="kt-icon-button kt-close" aria-label="Close account settings" onClick={() => onOpenChange(false)}>
          <Icon name="close" width="17" />
        </button>
        <aside className="kt-sidebar">
          <div className="kt-brand">Account</div>
          <div className="kt-account-mini">
            <span className="kt-avatar">{userName.slice(0, 2).toUpperCase()}</span>
            <div className="kt-account-copy">
              <div className="kt-account-name">{userName}</div>
              {session.user.email && <div className="kt-account-email">{session.user.email}</div>}
            </div>
          </div>
          <nav className="kt-nav" aria-label="Account settings">{navigation}</nav>
          <div className="kt-sidebar-bottom">
            <button type="button" className="kt-nav-button kt-signout" disabled={busy === "signout"} onClick={() => void signOut()}>
              <Icon name="logout" />Sign out
            </button>
          </div>
        </aside>
        <main className="kt-content">
          <nav className="kt-mobile-head" aria-label="Account settings">{navigation}</nav>
          <h2 className="kt-title" id={titleId}>{viewCopy[view][0]}</h2>
          <p className="kt-subtitle">{viewCopy[view][1]}</p>
          {error && <div className="kt-notice kt-error" role="alert">{error}</div>}
          {success && <div className="kt-notice kt-success" role="status">{success}</div>}

          {view === "profile" && (
            <form className="kt-section" onSubmit={(event) => void saveProfile(event)}>
              <div className="kt-section-head">
                <h3 className="kt-section-title">Personal details</h3>
                <p className="kt-section-copy">These details belong only to this project account.</p>
              </div>
              <div className="kt-section-body">
                <div className="kt-grid">
                  <div className="kt-field"><label htmlFor={`${titleId}-username`}>Username</label><input className="kt-input" id={`${titleId}-username`} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
                  <div className="kt-field"><label htmlFor={`${titleId}-email`}>Email address</label><input className="kt-input" id={`${titleId}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                </div>
                <div className="kt-actions"><button className="kt-button kt-primary" disabled={busy === "profile"}>{busy === "profile" ? "Saving…" : "Save changes"}</button></div>
              </div>
            </form>
          )}

          {view === "security" && (
            <form className="kt-section" onSubmit={(event) => void changePassword(event)}>
              <div className="kt-section-head"><h3 className="kt-section-title">Change password</h3><p className="kt-section-copy">Changing your password signs you out on every device.</p></div>
              <div className="kt-section-body">
                <div className="kt-field"><label htmlFor={`${titleId}-current`}>Current password</label><input required className="kt-input" id={`${titleId}-current`} name="currentPassword" type="password" autoComplete="current-password" /></div>
                <div className="kt-grid" style={{ marginTop: 14 }}>
                  <div className="kt-field"><label htmlFor={`${titleId}-new`}>New password</label><input required minLength={8} className="kt-input" id={`${titleId}-new`} name="newPassword" type="password" autoComplete="new-password" /></div>
                  <div className="kt-field"><label htmlFor={`${titleId}-confirm`}>Confirm new password</label><input required minLength={8} className="kt-input" id={`${titleId}-confirm`} name="confirmPassword" type="password" autoComplete="new-password" /></div>
                </div>
                <div className="kt-actions"><button className="kt-button kt-primary" disabled={busy === "password"}>{busy === "password" ? "Updating…" : "Update password"}</button></div>
              </div>
            </form>
          )}

          {view === "sessions" && (
            <>
              <section className="kt-section">
                <div className="kt-section-head"><h3 className="kt-section-title">Active sessions</h3><p className="kt-section-copy">Sign out devices you do not recognize.</p></div>
                <div className="kt-section-body">
                  {sessionsLoading ? <><div className="kt-skeleton" /><div className="kt-skeleton" /></> : sessions.length === 0 ? <div className="kt-empty">No active sessions found.</div> : sessions.map((item) => (
                    <div className="kt-session" key={item.display_id}>
                      <span className="kt-device-icon"><Icon name="device" /></span>
                      <div className="kt-session-main">
                        <div className="kt-session-name">{item.device || "Unknown device"}{item.current && <span className="kt-current">Current</span>}</div>
                        <div className="kt-session-meta">{item.application ? `${item.application} · ` : ""}Last active {formatDate(item.last_active_at)}{item.network_hint ? ` · ${item.network_hint}` : ""}</div>
                      </div>
                      {!item.current && <button type="button" className="kt-link-button" disabled={busy !== null} onClick={() => void revoke("one", item.display_id)}>Sign out</button>}
                    </div>
                  ))}
                </div>
              </section>
              <section className="kt-section">
                <div className="kt-section-head"><h3 className="kt-section-title">Session controls</h3><p className="kt-section-copy">You can sign out other devices or end every active session.</p></div>
                <div className="kt-section-body"><div className="kt-actions">
                  <button type="button" className="kt-button kt-danger-button" onClick={() => setConfirm("all")}>Sign out everywhere</button>
                  <button type="button" className="kt-button kt-secondary" onClick={() => setConfirm("others")}>Sign out other devices</button>
                </div></div>
                {confirm && <div className="kt-confirm"><strong>{confirm === "all" ? "Sign out everywhere?" : "Sign out other devices?"}</strong><p>{confirm === "all" ? "This also ends the session on this device." : "Your current session will remain active."}</p><div className="kt-confirm-actions"><button type="button" className="kt-button kt-secondary" onClick={() => setConfirm(null)}>Cancel</button><button type="button" className="kt-button kt-danger-button" disabled={busy !== null} onClick={() => void revoke(confirm)}>Confirm sign out</button></div></div>}
              </section>
            </>
          )}
        </main>
      </div>
    </div>,
    document.body,
  );
}
