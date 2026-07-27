import type { ApiError, ApiResponse, ResolvedClientOptions, Result } from "./types.js";

export type RequestContext = {
  options: ResolvedClientOptions;
  getAccessToken: () => string | null;
  onUnauthorized?: () => Promise<string | null>;
};

export async function request<T>(
  ctx: RequestContext,
  method: string,
  path: string,
  init?: {
    body?: unknown;
    query?: Record<string, string | undefined>;
    auth?: boolean;
    headers?: Record<string, string>;
  },
): Promise<Result<T>> {
  const base = ctx.options.url.replace(/\/+$/, "");
  const url = new URL(base + path);
  if (init?.query) {
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined && v !== "") {
        url.searchParams.set(k, v);
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Project-Key": ctx.options.projectKey,
    "X-Client-Info": "tinybase-js/0.1.0",
    ...(ctx.options.headers ?? {}),
    ...(init?.headers ?? {}),
  };

  if (init?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const useAuth = init?.auth !== false;
  let token = useAuth ? ctx.getAccessToken() : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchFn = ctx.options.fetch ?? globalThis.fetch;
  if (!fetchFn) {
    return {
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: "fetch is not available; pass ClientOptions.fetch",
      },
    };
  }

  const doFetch = async (accessToken: string | null) => {
    const h = { ...headers };
    if (accessToken) {
      h.Authorization = `Bearer ${accessToken}`;
    } else {
      delete h.Authorization;
    }
    return fetchFn(url.toString(), {
      method,
      headers: h,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  };

  let res = await doFetch(token);
  if (res.status === 401 && useAuth && token && ctx.onUnauthorized) {
    const refreshed = await ctx.onUnauthorized();
    if (refreshed) {
      token = refreshed;
      res = await doFetch(token);
    }
  }

  let payload: ApiResponse<T> | null = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text) as ApiResponse<T>;
    } catch {
      return {
        data: null,
        error: {
          code: "INVALID_REQUEST",
          message: `invalid JSON response (${res.status})`,
          details: text.slice(0, 200),
        },
      };
    }
  }

  if (!res.ok || payload?.error) {
    const err: ApiError = payload?.error ?? {
      code: "INTERNAL_ERROR",
      message: res.statusText || `HTTP ${res.status}`,
    };
    return {
      data: null,
      error: err,
      requestId: payload?.meta?.request_id,
      count: payload?.meta?.count,
    };
  }

  return {
    data: (payload?.data ?? null) as T | null,
    error: null,
    requestId: payload?.meta?.request_id,
    count: payload?.meta?.count,
  };
}

/** Format a value for PostgREST-style filter query params. */
export function formatFilterValue(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  return String(value);
}
