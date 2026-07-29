/** Standard TinyBase API envelope. */
export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta: {
    request_id: string;
    count?: number;
  };
};

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type AppUser = {
  id: string;
  email: string | null;
  username: string | null;
  status: string;
  email_verified?: boolean;
  last_sign_in_at: string | null;
  created_at: string;
};

export type Session = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AppUser;
  /** Absolute expiry time (ms since epoch) for the access token. */
  expires_at?: number;
  /** OAuth Application client id when the session came from Hosted Auth. */
  oauth_client_id?: string;
  /**
   * Auth v2: "pending_verification" means signup succeeded without a usable session.
   * "authenticated" means access+refresh tokens are present.
   */
  status?: "authenticated" | "pending_verification";
};

/** Auth v2 OTP issue/resend public response (enumeration-safe). */
export type OTPIssueResult = {
  status: string;
  message: string;
  expires_in?: number;
};

export type VerifyEmailOTPInput = {
  code: string;
  email?: string;
  userId?: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  email: string;
  code: string;
  newPassword: string;
};

export type AuthChangeEvent =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED";

export type AuthStorage = {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
};

export type ClientOptions = {
  /** API base URL. Default: https://tinybaseapis.knotree.com */
  url?: string;
  projectKey: string;
  fetch?: typeof fetch;
  storage?: AuthStorage;
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  /** Storage key for persisted session. Default: tinybase.auth.token */
  storageKey?: string;
  headers?: Record<string, string>;
  portalBaseUrl?: string;
};

/** Fully normalized client configuration used after construction. */
export type ResolvedClientOptions = Omit<ClientOptions, "url"> & {
  url: string;
};

export type RedirectSignInOptions = {
  clientId: string;
  redirectUri: string;
  scopes?: ("profile" | "email" | "offline_access")[];
  prompt?: "login" | "select_account";
};

export type RedirectCallbackOptions = {
  url?: string;
  replaceHistory?: (url: string) => void;
};

export type GoogleSignInOptions = {
  /** Exact browser callback URL allowed by the Project origin list. */
  returnUri?: string;
  /** Defaults to sign-in; link requires an authenticated session and password. */
  mode?: "signin" | "link";
  currentPassword?: string;
};

/** Generic database schema map for typed .from() helpers. */
export type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
};

export type GenericDatabase = Record<string, GenericTable>;

export type Result<T> = {
  data: T | null;
  error: ApiError | null;
  count?: number;
  requestId?: string;
};

export type FunctionInvokeOptions = {
  /** HTTP method exposed to the function runtime. Default: POST. */
  method?: string;
  /** Optional path appended after the function slug. */
  path?: string;
  query?: Record<string, string | undefined>;
  headers?: Record<string, string>;
  /** Objects are JSON encoded; BodyInit values are sent unchanged. */
  body?: unknown;
  signal?: AbortSignal;
};

export type FunctionResponseMeta = {
  status: number;
  headers: Headers;
  invocationId: string | null;
  version: number | null;
};

export type FunctionInvokeResult<T> = {
  data: T | null;
  error: ApiError | null;
  response: FunctionResponseMeta | null;
};

export type SignUpCredentials = {
  email?: string;
  username?: string;
  password: string;
};

export type SignInCredentials = {
  email?: string;
  username?: string;
  password: string;
};

export type UpdateUserInput = {
  email?: string;
  username?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

/** Non-secret Project login session row for app-user account management. */
export type AccountSession = {
  display_id: string;
  current: boolean;
  application?: string;
  device: string;
  network_hint?: string;
  signed_in_at: string;
  last_active_at: string;
  expires_at: string;
  revoked_at?: string | null;
};

export type RevokeSessionsInput = {
  mode: "one" | "others" | "all";
  /** Required when mode is "one". */
  displayId?: string;
};

export type OrderOptions = {
  ascending?: boolean;
};
