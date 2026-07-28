import type { CSSProperties, ReactNode } from "react";
import type { TinyBaseClient } from "../client.js";
import type { GenericDatabase } from "../types.js";

export type AccountView = "profile" | "security" | "sessions";

/** Auth popup steps (Auth v2 / US-119–US-120). */
export type AuthView = "sign-in" | "sign-up" | "otp" | "forgot" | "reset";

export type KnotreeAppearance = {
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  dangerColor?: string;
  borderRadius?: number;
  fontFamily?: string;
};

export type KnotreeProviderProps<DB extends GenericDatabase = GenericDatabase> = {
  client: TinyBaseClient<DB>;
  children: ReactNode;
  appearance?: KnotreeAppearance;
  onAfterSignOut?: () => void;
};

export type UserButtonProps = {
  appearance?: KnotreeAppearance;
  className?: string;
  style?: CSSProperties;
  label?: string;
  /** Label when signed out (opens Auth modal). */
  signedOutLabel?: string;
  showName?: boolean;
  defaultView?: AccountView;
  afterSignOut?: () => void;
  /** Optional first-party Google handler (US-116 may wire fully later). */
  onGoogle?: () => void | Promise<void>;
};

export type UserProfileProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: AccountView;
  appearance?: KnotreeAppearance;
  afterSignOut?: () => void;
};

export type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appearance?: KnotreeAppearance;
  defaultView?: AuthView;
  googleLabel?: string;
  onGoogle?: () => void | Promise<void>;
};
