import type { CSSProperties, ReactNode } from "react";
import type { TinyBaseClient } from "../client.js";
import type { GenericDatabase } from "../types.js";

export type AccountView = "hub" | "profile" | "security" | "sessions";

/** Auth popup steps (Auth v2 / US-119–US-120). */
export type AuthView = "sign-in" | "sign-up" | "otp" | "forgot" | "reset";

/** Color/theme mode for the account UI. */
export type KnotreeAppearanceMode = "auto" | "light" | "dark";

export type KnotreeAppearance = {
  /** Optional second accent color for the gradient. Defaults to a violet tone. */
  accentColor2?: string;
  accentColor?: string;
  backgroundColor?: string;
  /** Slightly elevated surface (used for cards / dialog body). */
  elevatedColor?: string;
  textColor?: string;
  /** Slightly stronger text color for headings. */
  textColorStrong?: string;
  mutedColor?: string;
  /** Slightly stronger muted color (icons inside buttons). */
  mutedColor2?: string;
  borderColor?: string;
  borderColorStrong?: string;
  dangerColor?: string;
  successColor?: string;
  warningColor?: string;
  borderRadius?: number;
  /** Small element radius (inputs, buttons, small surfaces). */
  borderRadiusSm?: number;
  /** Large element radius (cards, hero, dialog). */
  borderRadiusLg?: number;
  fontFamily?: string;
  /** Light/dark/auto. Default "auto" follows the user's OS preference. */
  mode?: KnotreeAppearanceMode;
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
  /**
   * Branding shown on the gradient banner above the form.
   * Defaults to "Knotree". Set to null/empty string to hide the mark.
   */
  brandLabel?: string | null;
};

