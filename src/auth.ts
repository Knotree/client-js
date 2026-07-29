import { request, type RequestContext } from "./http.js";
import type {
  AccountSession,
  AppUser,
  AuthChangeEvent,
  AuthStorage,
  ChangePasswordInput,
  ForgotPasswordInput,
  GoogleSignInOptions,
  OTPIssueResult,
  ResolvedClientOptions,
  Result,
  RedirectCallbackOptions,
  RedirectSignInOptions,
  ResetPasswordInput,
  RevokeSessionsInput,
  Session,
  SignInCredentials,
  SignUpCredentials,
  UpdateUserInput,
  VerifyEmailOTPInput,
} from "./types.js";

type Listener = (event: AuthChangeEvent, session: Session | null) => void;

/** Minimal Web Locks API surface used for cross-tab refresh serialization. */
type WebLocksManagerLike = {
  request(name: string, callback: () => Promise<unknown>): Promise<unknown>;
};

export class AuthClient {
  private session: Session | null = null;
  private listeners = new Set<Listener>();
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private storage: AuthStorage;
  private storageKey: string;
  private persist: boolean;
  private autoRefresh: boolean;
  private ready: Promise<void>;
  private refreshInFlight: Promise<Result<Session>> | null = null;

  private unboundStorageListener: ((e: StorageEvent) => void) | null = null;
  private unboundVisibilityListener: (() => void) | null = null;

  constructor(
    private readonly options: ResolvedClientOptions,
    private readonly getRequestContext: () => RequestContext,
  ) {
    this.storage = options.storage ?? createFallbackStorage();
    this.storageKey = options.storageKey ?? "tinybase.auth.token";
    this.persist = options.persistSession !== false;
    this.autoRefresh = options.autoRefreshToken !== false;
    this.ready = this.restore();
    this.bindCrossTabAndVisibility();
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

  /**
   * Create a Project app user. With email, Auth v2 returns pending_verification
   * without storing a session (OTP required). Username-only still signs in.
   */
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
    if (result.data && this.isUsableSession(result.data)) {
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
    // EMAIL_NOT_VERIFIED: no tokens; client continues OTP step (US-113/US-117).
    if (result.data && this.isUsableSession(result.data)) {
      await this.setSession(result.data, "SIGNED_IN");
    }
    return result;
  }

  /**
   * Open first-party Google sign-in in a popup. This Project-plane flow does
   * not use Hosted Auth Applications or the OAuth consent endpoint.
   */
  async signInWithGoogle(
    options: GoogleSignInOptions = {},
  ): Promise<Result<Session>> {
    await this.ready;
    if (typeof window === "undefined" || typeof window.open !== "function") {
      return redirectError("GOOGLE_BROWSER_REQUIRED", "Google sign-in requires a browser");
    }
    const mode = options.mode ?? "signin";
    const returnUri = options.returnUri ?? window.location.href;
    const popup = window.open(
      "about:blank",
      "tinybase-google-sign-in",
      "popup,width=480,height=720,resizable=yes,scrollbars=yes",
    );
    if (!popup) {
      return redirectError("GOOGLE_POPUP_BLOCKED", "Google sign-in popup was blocked");
    }
    const started = await request<{ authorization_url: string }>(
      this.ctx(),
      "POST",
      "/v1/auth/google/start",
      {
        body: {
          mode,
          return_uri: returnUri,
          current_password: options.currentPassword ?? "",
        },
        auth: mode === "link",
      },
    );
    if (!started.data) {
      popup.close();
      return { data: null, error: started.error };
    }
    const authorizationURL = started.data.authorization_url;
    return new Promise<Result<Session>>((resolve) => {
      const expectedOrigin = new URL(returnUri).origin;
      let settled = false;
      const finish = (result: Result<Session>) => {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", onMessage);
        if (timer !== null) window.clearInterval(timer);
        if (!popup.closed) popup.close();
        resolve(result);
      };
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== expectedOrigin || event.source !== popup) return;
        const payload = event.data as {
          type?: string;
          session?: Session | null;
          error?: { code?: string; message?: string };
        };
        if (payload?.type !== "google_result") return;
        if (payload.error) {
          finish(redirectError(payload.error.code ?? "GOOGLE_SIGN_IN_FAILED", payload.error.message ?? "Google sign-in failed"));
          return;
        }
        if (mode === "signin" && payload.session) {
          void this.setSession(payload.session, "SIGNED_IN").then(() => finish({ data: this.session, error: null }));
          return;
        }
        finish({ data: payload.session ?? null, error: null });
      };
      window.addEventListener("message", onMessage);
      const timer = window.setInterval(() => {
        if (popup.closed) finish(redirectError("GOOGLE_CANCELLED", "Google sign-in was cancelled"));
      }, 250);
      popup.location.href = authorizationURL;
    });
  }

  /** Issue a 6-digit email verification OTP (Auth v2). */
  async issueEmailOtp(input: {
    email?: string;
    userId?: string;
  }): Promise<Result<OTPIssueResult>> {
    await this.ready;
    return request<OTPIssueResult>(this.ctx(), "POST", "/v1/auth/otp/issue", {
      body: {
        purpose: "verify_email",
        email: input.email ?? "",
        user_id: input.userId ?? "",
      },
      auth: false,
    });
  }

  /** Resend verification OTP (supersedes prior code). */
  async resendEmailOtp(input: {
    email?: string;
    userId?: string;
  }): Promise<Result<OTPIssueResult>> {
    await this.ready;
    return request<OTPIssueResult>(this.ctx(), "POST", "/v1/auth/otp/resend", {
      body: {
        purpose: "verify_email",
        email: input.email ?? "",
        user_id: input.userId ?? "",
      },
      auth: false,
    });
  }

  /**
   * Verify email OTP and store the issued session on success.
   */
  async verifyEmailOtp(
    input: VerifyEmailOTPInput,
  ): Promise<Result<Session>> {
    await this.ready;
    const result = await request<Session>(
      this.ctx(),
      "POST",
      "/v1/auth/otp/verify",
      {
        body: {
          purpose: "verify_email",
          code: input.code,
          email: input.email ?? "",
          user_id: input.userId ?? "",
        },
        auth: false,
      },
    );
    if (result.data && this.isUsableSession(result.data)) {
      await this.setSession(result.data, "SIGNED_IN");
    }
    return result;
  }

  /** Enumeration-safe forgot password (sends OTP when eligible). */
  async forgotPassword(
    input: ForgotPasswordInput,
  ): Promise<Result<OTPIssueResult>> {
    await this.ready;
    return request<OTPIssueResult>(
      this.ctx(),
      "POST",
      "/v1/auth/forgot-password",
      {
        body: { email: input.email },
        auth: false,
      },
    );
  }

  /**
   * Reset password with 6-digit OTP. Does not auto sign-in; caller may signIn after.
   */
  async resetPassword(
    input: ResetPasswordInput,
  ): Promise<Result<{ status: string }>> {
    await this.ready;
    return request<{ status: string }>(
      this.ctx(),
      "POST",
      "/v1/auth/reset-password",
      {
        body: {
          email: input.email,
          code: input.code,
          new_password: input.newPassword,
        },
        auth: false,
      },
    );
  }

  /**
   * Hosted Auth Application OAuth redirect (standby / non-primary under Auth v2).
   * Prefer popup email+password + OTP for customer apps.
   */
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
        error?: string | { code: string; message: string };
        error_description?: string;
      };
      if (!response.ok || !payload.access_token)
        return {
          data: null,
          error: oauthResponseError(
            payload,
            "REDIRECT_EXCHANGE_FAILED",
            "authorization code exchange failed",
          ),
        };
      const provisional: Session = {
        access_token: payload.access_token,
        refresh_token: payload.refresh_token ?? "",
        token_type: payload.token_type ?? "Bearer",
        expires_in: payload.expires_in ?? 900,
        oauth_client_id: record.clientId,
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
    const oauthClientId = this.session?.oauth_client_id;
    let result: Result<{ status: string }> = {
      data: { status: "signed_out" },
      error: null,
    };
    if (refresh) {
      if (oauthClientId) {
        result = await this.revokeToken(refresh, oauthClientId);
        if (result.data) {
          result = { data: { status: "signed_out" }, error: null };
        }
      } else {
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
    return this.refreshSessionInternal();
  }

  private refreshSessionInternal(): Promise<Result<Session>> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }
    // Serialize refresh across browser tabs via the Web Locks API so two tabs
    // never present the same (already-rotated) refresh token to the backend,
    // which would trigger reuse detection and revoke the whole session family
    // (D-0074). Falls back to in-tab single-flight when Web Locks is unavailable
    // (Node.js, jsdom, older browsers).
    const refresh = this.withCrossTabRefreshLock(() => this.performRefresh());
    this.refreshInFlight = refresh;
    void refresh.finally(() => {
      if (this.refreshInFlight === refresh) {
        this.refreshInFlight = null;
      }
    });
    return refresh;
  }

  private withCrossTabRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
    const nav = (
      globalThis as { navigator?: { locks?: WebLocksManagerLike } }
    ).navigator;
    if (nav?.locks && typeof nav.locks.request === "function") {
      return nav.locks.request("tinybase-auth-refresh", () => fn()) as Promise<T>;
    }
    return fn();
  }

  private async performRefresh(): Promise<Result<Session>> {
    // Re-read the latest persisted session in case another tab rotated the
    // refresh token while this tab waited for the Web Lock or in-tab
    // single-flight (D-0074). If a fresh, rotated session is now present,
    // adopt it instead of POSTing a stale refresh token.
    const previousToken = this.session?.access_token ?? null;
    if (await this.maybeAdoptRotatedSession(previousToken)) {
      return { data: this.session, error: null };
    }
    if (!this.session?.refresh_token) {
      return {
        data: null,
        error: { code: "AUTH_REQUIRED", message: "no refresh token" },
      };
    }
    const current = this.session;
    let result: Result<Session>;
    try {
      result = current.oauth_client_id
        ? await this.refreshHostedSession(current)
        : await request<Session>(this.ctx(), "POST", "/v1/auth/refresh", {
            body: { refresh_token: current.refresh_token },
            auth: false,
          });
    } catch {
      // Transient network failure — keep session (D-0073 / US-118).
      return {
        data: null,
        error: {
          code: "NETWORK_ERROR",
          message: "session refresh failed due to a network error",
        },
      };
    }
    if (result.data && this.isUsableSession(result.data)) {
      // Preserve oauth_client_id across password-path refreshes when present.
      if (current.oauth_client_id && !result.data.oauth_client_id) {
        result.data.oauth_client_id = current.oauth_client_id;
      }
      await this.setSession(result.data, "TOKEN_REFRESHED");
      return result;
    }
    // Grace retry on reuse detection (D-0074): a concurrent tab likely rotated
    // the refresh token, so this tab presented a now-rotated token. Re-read
    // storage once before clearing; if a fresh rotated session is present,
    // adopt it instead of signing the user out.
    if (result.error?.code === "REFRESH_TOKEN_REUSED") {
      if (await this.maybeAdoptRotatedSession(current.access_token)) {
        return { data: this.session, error: null };
      }
    }
    // Clear only on definitive auth failure (invalid/revoked grant), not on
    // transient 5xx/network/rate-limit responses (D-0073).
    if (result.error && isDefinitiveAuthFailure(result.error.code)) {
      await this.clearSession("SIGNED_OUT");
    }
    return result;
  }

  /**
   * Read and normalize the latest persisted session from storage (or the
   * in-memory session when persistence is disabled).
   */
  private async readLatestSession(): Promise<Session | null> {
    if (!this.persist) {
      return this.session ? normalizeSession(this.session) : null;
    }
    try {
      const raw = await this.storage.getItem(this.storageKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Session;
      if (!parsed.access_token) {
        return null;
      }
      return normalizeSession(parsed);
    } catch {
      return null;
    }
  }

  /**
   * Adopt a session that another tab rotated (different, non-expired access
   * token) instead of POSTing a stale refresh token. Returns true when the
   * in-memory session was replaced and no network refresh is needed.
   */
  private async maybeAdoptRotatedSession(
    previousToken: string | null,
  ): Promise<boolean> {
    if (!previousToken) {
      return false;
    }
    const latest = await this.readLatestSession();
    if (
      !latest ||
      !latest.access_token ||
      latest.access_token === previousToken ||
      this.isExpired(latest)
    ) {
      return false;
    }
    this.session = latest;
    this.scheduleRefresh();
    this.emit("TOKEN_REFRESHED", this.session);
    return true;
  }

  private async refreshHostedSession(
    current: Session,
  ): Promise<Result<Session>> {
    const fetcher = this.options.fetch ?? fetch;
    try {
      const response = await fetcher(
        `${this.options.url.replace(/\/$/, "")}/oauth/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: current.oauth_client_id!,
            refresh_token: current.refresh_token,
          }),
        },
      );
      const payload = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        token_type?: string;
        expires_in?: number;
        error?: string | { code: string; message: string };
        error_description?: string;
      };
      if (!response.ok || !payload.access_token) {
        return {
          data: null,
          error: oauthResponseError(
            payload,
            "TOKEN_REFRESH_FAILED",
            "Hosted Auth token refresh failed",
          ),
        };
      }
      return {
        data: {
          access_token: payload.access_token,
          refresh_token: payload.refresh_token ?? current.refresh_token,
          token_type: payload.token_type ?? current.token_type,
          expires_in: payload.expires_in ?? current.expires_in,
          user: current.user,
          oauth_client_id: current.oauth_client_id,
        },
        error: null,
      };
    } catch {
      return {
        data: null,
        error: {
          code: "TOKEN_REFRESH_FAILED",
          message: "Hosted Auth token refresh failed",
        },
      };
    }
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
      if (!session.access_token) {
        return;
      }
      // Set in-memory session before any refresh so initialize never flashes signed-out.
      this.session = normalizeSession(session);
      this.scheduleRefresh();
      // If expired, try refresh immediately (keep prior session on transient failure).
      if (this.isExpired(this.session)) {
        if (this.session.refresh_token) {
          await this.refreshSessionInternal();
        }
        // Missing refresh token with expired access: leave session until next action.
      }
    } catch {
      // ignore corrupt storage
    }
  }

  private bindCrossTabAndVisibility(): void {
    if (typeof window === "undefined") {
      return;
    }
    // Multi-tab: another tab wrote/cleared the same storage key.
    this.unboundStorageListener = (event: StorageEvent) => {
      if (event.key !== this.storageKey) {
        return;
      }
      void this.onExternalStorageChange(event.newValue);
    };
    window.addEventListener("storage", this.unboundStorageListener);
    // Refresh when tab becomes visible and access is near/past expiry.
    this.unboundVisibilityListener = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void this.onVisibilityRefresh();
      }
    };
    document.addEventListener("visibilitychange", this.unboundVisibilityListener);
  }

  private async onExternalStorageChange(raw: string | null): Promise<void> {
    if (!raw) {
      if (this.session) {
        this.session = null;
        this.clearRefreshTimer();
        this.emit("SIGNED_OUT", null);
      }
      return;
    }
    try {
      const session = normalizeSession(JSON.parse(raw) as Session);
      if (!session.access_token) {
        return;
      }
      const prev = this.session?.access_token;
      this.session = session;
      this.scheduleRefresh();
      if (prev !== session.access_token) {
        this.emit(prev ? "TOKEN_REFRESHED" : "SIGNED_IN", this.session);
      }
    } catch {
      // ignore
    }
  }

  private async onVisibilityRefresh(): Promise<void> {
    if (!this.session?.refresh_token) {
      return;
    }
    if (this.isExpired(this.session) || this.isNearExpiry(this.session)) {
      await this.refreshSessionInternal();
    }
  }

  private isNearExpiry(session: Session): boolean {
    const expiresAt = session.expires_at ?? 0;
    return Date.now() >= expiresAt - 120_000;
  }

  /** True when the response carries a data-plane-usable access token (Auth v2). */
  private isUsableSession(session: Session): boolean {
    if (!session?.access_token || !session.refresh_token) {
      return false;
    }
    if (session.status === "pending_verification") {
      return false;
    }
    return true;
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

function isDefinitiveAuthFailure(code: string): boolean {
  switch (code) {
    case "INVALID_GRANT":
    case "REFRESH_TOKEN_INVALID":
    case "REFRESH_TOKEN_REUSED":
    case "TOKEN_INVALID":
    case "AUTH_REQUIRED":
    case "INVALID_CREDENTIALS":
    case "invalid_grant":
      return true;
    default:
      return false;
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

function oauthResponseError(
  payload: {
    error?: string | { code: string; message: string };
    error_description?: string;
  },
  fallbackCode: string,
  fallbackMessage: string,
) {
  if (payload.error && typeof payload.error === "object") {
    return payload.error;
  }
  return {
    code: payload.error ?? fallbackCode,
    message: payload.error_description ?? fallbackMessage,
  };
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
