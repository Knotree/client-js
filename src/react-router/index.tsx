import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { KnotreeProvider } from "../react/context.js";
import type { KnotreeAppearance } from "../react/types.js";
import type { TinyBaseClient } from "../client.js";
import type { GenericDatabase } from "../types.js";

export { UserButton } from "../react/UserButton.js";
export { UserProfile } from "../react/UserProfile.js";
export { useKnotree } from "../react/context.js";
export type {
  AccountView,
  KnotreeAppearance,
  UserButtonProps,
  UserProfileProps,
} from "../react/types.js";

export type KnotreeRouterProviderProps<
  DB extends GenericDatabase = GenericDatabase,
> = {
  client: TinyBaseClient<DB>;
  children: ReactNode;
  appearance?: KnotreeAppearance;
  afterSignOutPath?: string;
  replaceAfterSignOut?: boolean;
};

export function KnotreeRouterProvider<
  DB extends GenericDatabase = GenericDatabase,
>({
  client,
  children,
  appearance,
  afterSignOutPath = "/sign-in",
  replaceAfterSignOut = true,
}: KnotreeRouterProviderProps<DB>) {
  const navigate = useNavigate();
  return (
    <KnotreeProvider
      client={client}
      appearance={appearance}
      onAfterSignOut={() =>
        navigate(afterSignOutPath, { replace: replaceAfterSignOut })
      }
    >
      {children}
    </KnotreeProvider>
  );
}
