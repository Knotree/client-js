import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "../types.js";
import { accountStyles, STYLE_ID } from "./styles.js";
import type {
  AccountView,
  KnotreeAppearance,
  KnotreeProviderProps,
} from "./types.js";

type AccountUiContextValue = {
  client: KnotreeProviderProps["client"];
  session: Session | null;
  ready: boolean;
  appearance?: KnotreeAppearance;
  activeView: AccountView;
  profileOpen: boolean;
  openUserProfile: (view?: AccountView) => void;
  closeUserProfile: () => void;
  setActiveView: (view: AccountView) => void;
  afterSignOut?: () => void;
};

const AccountUiContext = createContext<AccountUiContextValue | null>(null);

export function KnotreeProvider({
  client,
  children,
  appearance,
  onAfterSignOut,
}: KnotreeProviderProps) {
  const [session, setSession] = useState<Session | null>(
    client.auth.getSession(),
  );
  const [ready, setReady] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeView, setActiveView] = useState<AccountView>("profile");

  useEffect(() => {
    let mounted = true;
    void client.auth.initialize().then(() => {
      if (!mounted) return;
      setSession(client.auth.getSession());
      setReady(true);
    });
    const unsubscribe = client.auth.onAuthStateChange((_event, next) => {
      if (mounted) {
        setSession(next);
        setReady(true);
        if (!next) setProfileOpen(false);
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID))
      return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = accountStyles;
    document.head.appendChild(style);
  }, []);

  const openUserProfile = useCallback((view: AccountView = "profile") => {
    setActiveView(view);
    setProfileOpen(true);
  }, []);
  const closeUserProfile = useCallback(() => setProfileOpen(false), []);

  const value = useMemo<AccountUiContextValue>(
    () => ({
      client,
      session,
      ready,
      appearance,
      activeView,
      profileOpen,
      openUserProfile,
      closeUserProfile,
      setActiveView,
      afterSignOut: onAfterSignOut,
    }),
    [
      activeView,
      appearance,
      client,
      closeUserProfile,
      onAfterSignOut,
      openUserProfile,
      profileOpen,
      ready,
      session,
    ],
  );

  return (
    <AccountUiContext.Provider value={value}>
      {children}
    </AccountUiContext.Provider>
  );
}

export function useKnotree() {
  const value = useContext(AccountUiContext);
  if (!value) {
    throw new Error("useKnotree must be used inside <KnotreeProvider>");
  }
  return value;
}
