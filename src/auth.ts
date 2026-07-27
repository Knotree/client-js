import { request, type RequestContext } from "./http.js";
import type {
  AccountSession,
  AppUser,
  AuthChangeEvent,
  AuthStorage,
  ChangePasswordInput,
  ClientOptions,
  Result,
  RedirectCallbackOptions,
  RedirectSignInOptions,
  RevokeSessionsInput,
  Session,
  SignInCredentials,
  SignUpCredentials,
  UpdateUserInput,
} from "./types.js";

type Listener = (event: AuthChangeEvent, session: Session | null) => void;

export class AuthClient {
  private session: Session | null = null;
  private listeners = new Set<Listener>();
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private storage: AuthStorage;
  private storageKey: string;
  private persist: boolean;
  private autoRefresh: boolean;
  private ready: Promise<void>;

  constructor(
    private readonly options: ClientOptions,
    private readonly getRequestContext: () => RequestContext,
  ) {
    this.storage = options.storage ?? createFallbackStorage();
    this.storageKey = options.storageKey ?? "tinybase.auth.token";
    this.persist = options.persistSession !== false;
    this.autoRefresh = options.autoRefreshToken !== false;
    this.ready = this.restore();
  }

  private ctx(): RequestContext {
    return this.getRequestContext();
  }

  /** Wait until persisted session (if any) is loaded. */
  async initialize(): Promise<void> {
    await this.ready;
  }

  getSession(): Session | null {
    return this.session;
  }

  getAccessToken(): string | null {
    return this.session?.access_token ?? null;
  }

  onAuthStateChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async signUp(credentials: SignUpCredentials): Promise<Result<Session>> {
    await this.ready;
    const result = await request<Session>(
      this.ctx(),
      "POST",
      "/v1/auth/signup",
      {
        body: credentials,
        auth: false,
      },
    );
    if (result.data) {
      await this.setSession(result.data, "SIGNED_IN");
    }
    return result;
  }

  async signIn(credentials: SignInCredentials): Promise<Result<Session>> {
    await this.ready;
    const result = await request<Session>(
      this.ctx(),
      "POST",
      "/v1/auth/signin",
      {
        body: credentials,
        auth: false,
      },
    );
    if (result.data) {
      await this.setSession(result.data, "SIGNED_IN");
    }
    return result;
  }

  async signInWithRedirect(
    options: RedirectSignInOptions,
  ): Promise<Result<{ url: string; state: string }>> {
    await this.ready;
    try {
      const state = randomBase64Url(32);
      const verifier = randomBase64Url(48);
      const challenge = await pkceChallenge(verifier);
      const record = {
        verifier,
        clientId: options.clientId,
        redirectUri: options.redirectUri,
        createdAt: Date.now(),
      };
      await this.storage.setItem(
        `${this.storageKey}.redirect.${state}`,
        JSON.stringify(record),
      );
      const base = (this.options.portalBaseUrl ?? this.options.url).replace(
        /\/$/,
        "",
      );
      const url = new URL(`${base}/oauth/authorize`);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", options.clientId);
      url.searchParams.set("redirect_uri", options.redirectUri);
      url.searchParams.set(
        "scope",
        (options.scopes ?? ["profile", "email"]).join(" "),
      );
      url.searchParams.set("state", state);
      url.searchParams.set("code_challenge", challenge);
      url.searchParams.set("code_challenge_method", "S256");
      if (options.prompt) url.searchParams.set("prompt", options.prompt);
      return { data: { url: url.toString(), state }, error: null };
    } catch {
      return {
        data: null,
        error: {
          code: "REDIRECT_STORAGE_UNAVAILABLE",
          message: "redirect sign-in storage is unavailable",
        },
      };
    }
  }

  async handleRedirectCallback(
    options: RedirectCallbackOptions = {},
  ): Promise<Result<Session>> {
    await this.ready;
    const rawUrl =
      options.url ?? (typeof location !== "undefined" ? location.href : "");
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return redirectError(
        "REDIRECT_INVALID_CALLBACK",
        "callback URL is invalid",
      );
    }
    const code = parsed.searchParams.get("code");
    const state = parsed.searchParams.get("state");
    const providerError = parsed.searchParams.get("error");
    parsed.searchParams.delete("code");
    parsed.searchParams.delete("state");
    parsed.searchParams.delete("error");
    parsed.searchParams.delete("error_description");
    const cleaned = parsed.toString();
    if (options.replaceHistory) options.replaceHistory(cleaned);
    else if (
      typeof history !== "undefined" &&
      typeof history.replaceState === "function"
    )
      history.replaceState(history.state, "", cleaned);
    if (providerError)
      return redirectError("REDIRECT_CANCELLED", "authorization was cancelled");
    if (!code || !state)
      return redirectError(
        "REDIRECT_INVALID_CALLBACK",
        "callback code and state are required",
      );
    const key = `${this.storageKey}.redirect.${state}`;
    let record: {
      verifier: string;
      clientId: string;
      redirectUri: string;
      createdAt: number;
    };
    try {
      const raw = await this.storage.getItem(key);
      if (!raw)
        return redirectError(
          "REDIRECT_STATE_MISMATCH",
          "callback state does not match an active sign-in",
        );
      record = JSON.parse(raw) as typeof record;
      await this.storage.removeItem(key);
    } catch {
      return redirectError(
        "REDIRECT_STORAGE_UNAVAILABLE",
        "redirect sign-in storage is unavailable",
      );
    }
    if (!record.verifier || Date.now() - record.createdAt > 15 * 60_000)
      return redirectError(
        "REDIRECT_EXPIRED",
        "redirect sign-in transaction expired",
      );
    const fetcher = this.options.fetch ?? fetch;
    let response: Response;
    try {
      response = await fetcher(
        `${this.options.url.replace(/\/$/, "")}/oauth/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: record.clientId,
            code,
            redirect_uri: record.redirectUri,
            code_verifier: record.verifier,
          }),
        },
      );
      const payload = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        token_type?: string;
        expires_in?: number;
        error?: { code: string; message: string };
      };
      if (!response.ok || !payload.access_token)
        return {
          data: null,
          error: payload.error ?? {
            code: "REDIRECT_EXCHANGE_FAILED",
            message: "authorization code exchange failed",
          },
        };
      const provisional: Session = {
        access_token: payload.access_token,
        refresh_token: payload.refresh_token ?? "",
        token_type: payload.token_type ?? "Bearer",
        expires_in: payload.expires_in ?? 900,
        user: {
          id: "",
          email: null,
          username: null,
          status: "active",
          last_sign_in_at: null,
          created_at: "",
        },
      };
      await this.setSession(provisional, "SIGNED_IN");
      const user = await this.getUser();
      if (!user.data) {
        await this.clearSession("SIGNED_OUT");
        return { data: null, error: user.error };
      }
      return { data: this.session, error: null };
    } catch {
      return redirectError(
        "REDIRECT_EXCHANGE_FAILED",
        "authorization code exchange failed",
      );
    }
  }

  async revokeToken(
    token: string,
    clientId: string,
  ): Promise<Result<{ status: string }>> {
    const fetcher = this.options.fetch ?? fetch;
    try {
      const response = await fetcher(
        `${this.options.url.replace(/\/$/, "")}/oauth/revoke`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ token, client_id: clientId }),
        },
      );
      if (!response.ok)
        return redirectError("TOKEN_REVOKE_FAILED", "token revocation failed");
      return { data: { status: "revoked" }, error: null };
    } catch {
      return redirectError("TOKEN_REVOKE_FAILED", "token revocation failed");
    }
  }

  async signOut(): Promise<Result<{ status: string }>> {
    await this.ready;
    const refresh = this.session?.refresh_token;
    let result: Result<{ status: string }> = {
      data: { status: "signed_out" },
      error: null,
    };
    if (refresh) {
      result = await request<{ status: string }>(
        this.ctx(),
        "POST",
        "/v1/auth/signout",
        {
          body: { refresh_token: refresh },
          auth: false,
        },
      );
    }
    await this.clearSession("SIGNED_OUT");
    return result;
  }

  async getUser(): Promise<Result<AppUser>> {
    await this.ready;
    const result = await request<AppUser>(this.ctx(), "GET", "/v1/auth/user", {
      auth: true,
    });
    if (result.data && this.session) {
      this.session = { ...this.session, user: result.data };
      await this.persistSession();
      this.emit("USER_UPDATED", this.session);
    }
    return result;
  }

  /**
   * Update Project app-user profile fields (email and/or username).
   * This is Project-scoped only — never the TinyBase dashboard owner account.
   */
  async updateUser(input: UpdateUserInput): Promise<Result<AppUser>> {
    await this.ready;
    const body: Record<string, string> = {};
    if (input.email !== undefined) body.email = input.email;
    if (input.username !== undefined) body.username = input.username;
    const result = await request<AppUser>(
      this.ctx(),
      "PATCH",
      "/v1/auth/user",
      { body, auth: true },
    );
    if (result.data && this.session) {
      this.session = { ...this.session, user: result.data };
      await this.persistSession();
      this.emit("USER_UPDATED", this.session);
    }
    return result;
  }

  /**
   * Change the Project app-user password. Server revokes refresh sessions;
   * local session is cleared so the caller must sign in again.
   */
  async changePassword(
    input: ChangePasswordInput,
  ): Promise<Result<{ status: string }>> {
    await this.ready;
    const result = await request<{ status: string }>(
      this.ctx(),
      "POST",
      "/v1/auth/change-password",
      {
        body: {
          current_password: input.currentPassword,
          new_password: input.newPassword,
        },
        auth: true,
      },
    );
    if (result.data) {
      await this.clearSession("SIGNED_OUT");
    }
    return result;
  }

  /**
   * List active login sessions for this Project app user (non-secret metadata).
   * Marks the session matching the stored refresh token as current when present.
   */
  async listSessions(): Promise<Result<AccountSession[]>> {
    await this.ready;
    const refresh = this.session?.refresh_token ?? "";
    const query = refresh
      ? `?refresh_token=${encodeURIComponent(refresh)}`
      : "";
    return request<AccountSession[]>(
      this.ctx(),
      "GET",
      `/v1/auth/sessions${query}`,
      { auth: true },
    );
  }

  /**
   * Revoke one session, all other sessions, or every session for this Project user.
   * When mode is "all" (or the current session is revoked), local state is cleared.
   */
  async revokeSessions(
    input: RevokeSessionsInput,
  ): Promise<Result<{ status: string }>> {
    await this.ready;
    const result = await request<{ status: string }>(
      this.ctx(),
      "POST",
      "/v1/auth/sessions/revoke",
      {
        body: {
          mode: input.mode,
          display_id: input.displayId ?? "",
          refresh_token: this.session?.refresh_token ?? "",
        },
        auth: true,
      },
    );
    if (result.data && (input.mode === "all" || input.mode === "one")) {
      // "one" may target current; safest for "all" is always clear.
      if (input.mode === "all") {
        await this.clearSession("SIGNED_OUT");
      }
    }
    return result;
  }

  async refreshSession(): Promise<Result<Session>> {
    await this.ready;
    if (!this.session?.refresh_token) {
      return {
        data: null,
        error: { code: "AUTH_REQUIRED", message: "no refresh token" },
      };
    }
    const result = await request<Session>(
      this.ctx(),
      "POST",
      "/v1/auth/refresh",
      {
        body: { refresh_token: this.session.refresh_token },
        auth: false,
      },
    );
    if (result.data) {
      await this.setSession(result.data, "TOKEN_REFRESHED");
    } else {
      await this.clearSession("SIGNED_OUT");
    }
    return result;
  }

  /** Called by HTTP layer on 401 to attempt a single refresh. */
  async handleUnauthorized(): Promise<string | null> {
    const result = await this.refreshSession();
    return result.data?.access_token ?? null;
  }

  private async restore(): Promise<void> {
    if (!this.persist) {
      return;
    }
    try {
      const raw = await this.storage.getItem(this.storageKey);
      if (!raw) {
        return;
      }
      const session = JSON.parse(raw) as Session;
      if (!session.access_token || !session.refresh_token) {
        return;
      }
      this.session = normalizeSession(session);
      this.scheduleRefresh();
      // If expired, try refresh immediately.
      if (this.isExpired(this.session)) {
        await this.refreshSession();
      }
    } catch {
      // ignore corrupt storage
    }
  }

  private async setSession(
    session: Session,
    event: AuthChangeEvent,
  ): Promise<void> {
    this.session = normalizeSession(session);
    await this.persistSession();
    this.scheduleRefresh();
    this.emit(event, this.session);
  }

  private async clearSession(event: AuthChangeEvent): Promise<void> {
    this.session = null;
    this.clearRefreshTimer();
    if (this.persist) {
      await this.storage.removeItem(this.storageKey);
    }
    this.emit(event, null);
  }

  private async persistSession(): Promise<void> {
    if (!this.persist || !this.session) {
      return;
    }
    await this.storage.setItem(this.storageKey, JSON.stringify(this.session));
  }

  private emit(event: AuthChangeEvent, session: Session | null): void {
    for (const listener of this.listeners) {
      try {
        listener(event, session);
      } catch {
        // listener errors must not break auth
      }
    }
  }

  private isExpired(session: Session): boolean {
    const expiresAt = session.expires_at ?? 0;
    return Date.now() >= expiresAt - 5_000;
  }

  private scheduleRefresh(): void {
    this.clearRefreshTimer();
    if (!this.autoRefresh || !this.session) {
      return;
    }
    const expiresAt =
      this.session.expires_at ?? Date.now() + this.session.expires_in * 1000;
    const delay = Math.max(expiresAt - Date.now() - 60_000, 5_000);
    this.refreshTimer = setTimeout(() => {
      void this.refreshSession();
    }, delay);
    // Allow Node to exit without waiting for timer in tests.
    const timer = this.refreshTimer as { unref?: () => void } | null;
    if (timer && typeof timer.unref === "function") {
      timer.unref();
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

function redirectError<T>(code: string, message: string): Result<T> {
  return { data: null, error: { code, message } };
}
function randomBase64Url(size: number): string {
  const bytes = new Uint8Array(size);
  globalThis.crypto.getRandomValues(bytes);
  let raw = "";
  for (const byte of bytes) raw += String.fromCharCode(byte);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  let raw = "";
  for (const byte of new Uint8Array(digest)) raw += String.fromCharCode(byte);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function normalizeSession(session: Session): Session {
  const expires_at =
    session.expires_at ?? Date.now() + (session.expires_in ?? 900) * 1000;
  return { ...session, expires_at };
}

function createFallbackStorage(): AuthStorage {
  // Lazy import avoided; inline memory storage to prevent circular deps in bundlers.
  const store = new Map<string, string>();
  return {
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    setItem: (k, v) => {
      store.set(k, v);
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
}
