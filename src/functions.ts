import type { RequestContext } from "./http.js";
import type {
  ApiError,
  FunctionInvokeOptions,
  FunctionInvokeResult,
  FunctionResponseMeta,
} from "./types.js";

/** Invoke project Edge Functions from browser and Node.js applications. */
export class EdgeFunctionsClient {
  constructor(private readonly ctx: () => RequestContext) {}

  async invoke<T = unknown>(
    slug: string,
    options: FunctionInvokeOptions = {},
  ): Promise<FunctionInvokeResult<T>> {
    if (!/^[a-z][a-z0-9-]{0,62}$/.test(slug)) {
      return failure("INVALID_REQUEST", "edge function slug is invalid");
    }

    const ctx = this.ctx();
    const fetcher = ctx.options.fetch ?? globalThis.fetch;
    if (!fetcher) {
      return failure("INTERNAL_ERROR", "fetch is not available; pass ClientOptions.fetch");
    }

    const base = ctx.options.url.replace(/\/+$/, "");
    const suffix = encodeFunctionPath(options.path);
    const url = new URL(`${base}/v1/functions/${encodeURIComponent(slug)}${suffix}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, value);
    }

    const headers: Record<string, string> = {
      Accept: "application/json, text/plain, */*",
      "X-Client-Info": "tinybase-js/0.1.0",
      ...(ctx.options.headers ?? {}),
      ...(options.headers ?? {}),
      "X-Project-Key": ctx.options.projectKey,
    };
    const body = serializeBody(options.body, headers);
    let token = ctx.getAccessToken();
    const send = (accessToken: string | null) => {
      const requestHeaders = { ...headers };
      if (accessToken) requestHeaders.Authorization = `Bearer ${accessToken}`;
      else delete requestHeaders.Authorization;
      return fetcher(url.toString(), {
        method: options.method?.toUpperCase() || "POST",
        headers: requestHeaders,
        body,
        signal: options.signal,
      });
    };

    try {
      let response = await send(token);
      if (response.status === 401 && token && ctx.onUnauthorized) {
        const refreshed = await ctx.onUnauthorized();
        if (refreshed) {
          token = refreshed;
          response = await send(token);
        }
      }
      const meta = responseMeta(response);
      const data = await parseResponse<T>(response);
      if (!response.ok) {
        return { data: null, error: responseError(response, data), response: meta };
      }
      return { data, error: null, response: meta };
    } catch (error) {
      return failure(
        "EDGE_FUNCTION_NETWORK_ERROR",
        error instanceof Error ? error.message : "edge function request failed",
      );
    }
  }
}

function encodeFunctionPath(path?: string): string {
  const parts = (path ?? "").split("/").filter(Boolean);
  return parts.length ? `/${parts.map(encodeURIComponent).join("/")}` : "";
}

function serializeBody(body: unknown, headers: Record<string, string>): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return body;
  if (typeof Blob !== "undefined" && body instanceof Blob) return body;
  if (typeof FormData !== "undefined" && body instanceof FormData) return body;
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) return body;
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return body as BodyInit;
  if (!hasHeader(headers, "content-type")) headers["Content-Type"] = "application/json";
  return JSON.stringify(body);
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  return Object.keys(headers).some((key) => key.toLowerCase() === name);
}

async function parseResponse<T>(response: Response): Promise<T | null> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("json")) {
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }
  return text as T;
}

function responseMeta(response: Response): FunctionResponseMeta {
  const rawVersion = response.headers.get("X-Edge-Function-Version");
  const version = rawVersion ? Number.parseInt(rawVersion, 10) : null;
  return {
    status: response.status,
    headers: response.headers,
    invocationId: response.headers.get("X-Edge-Invocation-Id"),
    version: version !== null && Number.isFinite(version) ? version : null,
  };
}

function responseError(response: Response, data: unknown): ApiError {
  if (isErrorEnvelope(data)) return data.error;
  return {
    code: "EDGE_FUNCTION_HTTP_ERROR",
    message: `edge function returned HTTP ${response.status}`,
    details: data,
  };
}

function isErrorEnvelope(value: unknown): value is { error: ApiError } {
  if (!value || typeof value !== "object" || !("error" in value)) return false;
  const error = (value as { error?: unknown }).error;
  return !!error && typeof error === "object" && "code" in error && "message" in error;
}

function failure<T>(code: string, message: string): FunctionInvokeResult<T> {
  return { data: null, error: { code, message }, response: null };
}
