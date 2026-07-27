import { useMemo } from "react";
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
  showName = true,
  defaultView = "profile",
  afterSignOut,
}: UserButtonProps) {
  const {
    session,
    ready,
    appearance: inherited,
    profileOpen,
    openUserProfile,
    closeUserProfile,
  } = useKnotree();
  const name = session?.user.username || session?.user.email || "Account";
  const avatar = useMemo(() => initials(name).toUpperCase(), [name]);

  if (!ready || !session) return null;

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
        <span className="kt-avatar" aria-hidden="true">{avatar}</span>
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
