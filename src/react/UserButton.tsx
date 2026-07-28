import { useMemo } from "react";
import { AuthModal } from "./AuthModal.js";
import { Icon } from "./icons.js";
import { UserProfile } from "./UserProfile.js";
import { appearanceStyle } from "./styles.js";
import type { UserButtonProps } from "./types.js";
import { useKnotree } from "./context.js";

function initials(value: string) {
  const parts = value.trim().split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "");
}

export function UserButton({
  appearance,
  className,
  style,
  label = "Open account settings",
  signedOutLabel = "Sign in",
  showName = true,
  defaultView = "profile",
  afterSignOut,
  onGoogle,
}: UserButtonProps) {
  const {
    session,
    ready,
    appearance: inherited,
    profileOpen,
    openUserProfile,
    closeUserProfile,
    authOpen,
    openSignIn,
    closeSignIn,
  } = useKnotree();
  const name = session?.user.username || session?.user.email || "Account";
  const avatar = useMemo(() => initials(name).toUpperCase(), [name]);

  // Avoid signed-in/out flash before restore completes (D-0073 / US-119).
  if (!ready) {
    return (
      <span
        className={`kt-root kt-user-button kt-user-skeleton${className ? ` ${className}` : ""}`}
        style={{
          ...appearanceStyle({ ...inherited, ...appearance }),
          ...style,
        }}
        aria-hidden="true"
      >
        <span className="kt-avatar kt-avatar-skeleton" />
        {showName ? <span className="kt-user-label kt-skel-bar" /> : null}
      </span>
    );
  }

  if (!session) {
    return (
      <>
        <button
          type="button"
          aria-label={signedOutLabel}
          aria-haspopup="dialog"
          aria-expanded={authOpen}
          className={`kt-root kt-user-button kt-user-button-signed-out${className ? ` ${className}` : ""}`}
          style={{
            ...appearanceStyle({ ...inherited, ...appearance }),
            ...style,
          }}
          onClick={() => openSignIn()}
        >
          <span className="kt-avatar" aria-hidden="true">
            <Icon name="user" width="16" />
          </span>
          {showName && <span className="kt-user-label">{signedOutLabel}</span>}
        </button>
        <AuthModal
          open={authOpen}
          onOpenChange={(open) => {
            if (open) openSignIn();
            else closeSignIn();
          }}
          appearance={appearance}
          onGoogle={onGoogle}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={profileOpen}
        className={`kt-root kt-user-button${className ? ` ${className}` : ""}`}
        style={{
          ...appearanceStyle({ ...inherited, ...appearance }),
          ...style,
        }}
        onClick={() => openUserProfile(defaultView)}
      >
        <span className="kt-avatar" aria-hidden="true">
          {avatar}
        </span>
        {showName && <span className="kt-user-label">{name}</span>}
        <Icon className="kt-chevron" name="chevron" />
      </button>
      <UserProfile
        open={profileOpen}
        onOpenChange={(open) => {
          if (!open) closeUserProfile();
        }}
        appearance={appearance}
        afterSignOut={afterSignOut}
      />
    </>
  );
}
