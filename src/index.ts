export { createClient, DEFAULT_API_URL, TinyBaseClient } from "./client.js";
export { AuthClient } from "./auth.js";
export { EdgeFunctionsClient } from "./functions.js";
export { QueryBuilder } from "./query.js";
export { MemoryStorage, createDefaultStorage } from "./storage.js";
export type {
  AccountSession,
  ApiError,
  ApiResponse,
  AppUser,
  AuthChangeEvent,
  AuthStorage,
  ChangePasswordInput,
  ClientOptions,
  ForgotPasswordInput,
  GenericDatabase,
  GenericTable,
  FunctionInvokeOptions,
  FunctionInvokeResult,
  FunctionResponseMeta,
  OTPIssueResult,
  OrderOptions,
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
