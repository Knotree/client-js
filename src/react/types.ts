import type { CSSProperties, ReactNode } from "react";
import type { TinyBaseClient } from "../client.js";
import type { GenericDatabase } from "../types.js";

export type AccountView = "profile" | "security" | "sessions";

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
  showName?: boolean;
  defaultView?: AccountView;
  afterSignOut?: () => void;
};

export type UserProfileProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: AccountView;
  appearance?: KnotreeAppearance;
  afterSignOut?: () => void;
};
