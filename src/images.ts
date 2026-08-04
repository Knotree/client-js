import { request, type RequestContext } from "./http.js";
import type { ApiError } from "./types.js";

export type ImageVisibility = "public" | "authenticated" | "owner" | "signed";
export type ImageStatus = "pending" | "processing" | "ready" | "failed";
export type ImageTier = "thumb" | "sm" | "md" | "lg" | "original_proxy";
export type ImageFormat = "avif" | "webp" | "jpeg" | "png";

export type ImageVariant = {
  id: string;
  image_id: string;
  project_id: string;
  tier: string;
  format: string;
  width: number;
  height: number;
  size_bytes: number;
  content_type: string;
  created_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  filename: string;
  alt_text: string;
  content_type: string;
  size_bytes: number;
  width?: number | null;
  height?: number | null;
  visibility: ImageVisibility;
  status: ImageStatus;
  owner_user_id?: string | null;
  focal_x?: number | null;
  focal_y?: number | null;
  error_message?: string | null;
  variants?: ImageVariant[];
  created_at: string;
  updated_at: string;
};

export type ImageJob = {
  id: string;
  project_id: string;
  image_id: string;
  job_type: string;
  status: string;
  attempts: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
};

export type ImageUploadOptions = {
  visibility?: ImageVisibility;
  alt?: string;
  filename?: string;
  contentType?: string;
  signal?: AbortSignal;
};

export type ImageTransformOptions = {
  crop_x?: number;
  crop_y?: number;
  crop_width?: number;
  crop_height?: number;
  max_edge?: number;
  width?: number;
  height?: number;
  rotate?: number;
  flip_h?: boolean;
  flip_v?: boolean;
  quality?: number;
  formats?: string[];
};

export type ImageUrlOptions = {
  tier?: ImageTier | string;
  format?: ImageFormat | string;
  /** When set, builds signed download path (token must already be minted). */
  token?: string;
};

/**
 * Project Images client for customer sites (@knotree/client).
 * Upload / list / get / transform / delete + URL helpers for &lt;picture&gt;.
 */
export class ImagesClient {
  constructor(private readonly ctx: () => RequestContext) {}

  async list(query?: {
    status?: string;
    visibility?: string;
    prefix?: string;
    limit?: number;
  }): Promise<{ data: ProjectImage[] | null; error: ApiError | null }> {
    const res = await request<ProjectImage[]>(this.ctx(), "GET", "/v1/images", {
      query: {
        status: query?.status,
        visibility: query?.visibility,
        prefix: query?.prefix,
        limit: query?.limit != null ? String(query.limit) : undefined,
      },
    });
    return { data: res.data ?? null, error: res.error };
  }

  async get(
    id: string,
  ): Promise<{ data: ProjectImage | null; error: ApiError | null }> {
    if (!id) {
      return { data: null, error: { code: "INVALID_REQUEST", message: "image id required" } };
    }
    const res = await request<ProjectImage>(
      this.ctx(),
      "GET",
      `/v1/images/${encodeURIComponent(id)}`,
    );
    return { data: res.data ?? null, error: res.error };
  }

  async upload(
    file: Blob | ArrayBuffer | ArrayBufferView | string,
    options: ImageUploadOptions = {},
  ): Promise<{
    data: { image: ProjectImage; job: ImageJob } | null;
    error: ApiError | null;
  }> {
    const ctx = this.ctx();
    const fetcher = ctx.options.fetch ?? globalThis.fetch;
    if (!fetcher) {
      return {
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "fetch is not available; pass ClientOptions.fetch",
        },
      };
    }
    const base = ctx.options.url.replace(/\/+$/, "");
    const qs = new URLSearchParams();
    if (options.filename) qs.set("filename", options.filename);
    if (options.alt) qs.set("alt", options.alt);
    if (options.visibility) qs.set("visibility", options.visibility);
    const url = `${base}/v1/images?${qs.toString()}`;
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Project-Key": ctx.options.projectKey,
      "X-Client-Info": "tinybase-js/0.1.0",
      ...(ctx.options.headers ?? {}),
    };
    let contentType = options.contentType;
    if (!contentType && typeof Blob !== "undefined" && file instanceof Blob && file.type) {
      contentType = file.type;
    }
    if (!contentType) contentType = "application/octet-stream";
    headers["Content-Type"] = contentType;

    const send = async (accessToken: string | null) => {
      const h = { ...headers };
      if (accessToken) h.Authorization = `Bearer ${accessToken}`;
      return fetcher(url, {
        method: "POST",
        headers: h,
        body: file as BodyInit,
        signal: options.signal,
      });
    };

    try {
      let token = ctx.getAccessToken();
      let response = await send(token);
      if (response.status === 401 && token && ctx.onUnauthorized) {
        const refreshed = await ctx.onUnauthorized();
        if (refreshed) {
          token = refreshed;
          response = await send(token);
        }
      }
      const json = (await response.json()) as {
        data: { image: ProjectImage; job: ImageJob } | null;
        error: ApiError | null;
      };
      if (!response.ok || json.error) {
        return {
          data: null,
          error: json.error ?? {
            code: "UPLOAD_FAILED",
            message: `upload failed (${response.status})`,
          },
        };
      }
      return { data: json.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "upload failed",
        },
      };
    }
  }

  async transform(
    id: string,
    options: ImageTransformOptions,
  ): Promise<{
    data: { image: ProjectImage; job: ImageJob } | null;
    error: ApiError | null;
  }> {
    const res = await request<{ image: ProjectImage; job: ImageJob }>(
      this.ctx(),
      "POST",
      `/v1/images/${encodeURIComponent(id)}/transform`,
      { body: options },
    );
    return { data: res.data ?? null, error: res.error };
  }

  async remove(
    id: string,
  ): Promise<{ data: { status: string } | null; error: ApiError | null }> {
    const res = await request<{ status: string }>(
      this.ctx(),
      "DELETE",
      `/v1/images/${encodeURIComponent(id)}`,
    );
    return { data: res.data ?? null, error: res.error };
  }

  async sign(
    id: string,
    options: { tier?: string; format?: string; ttl_seconds?: number } = {},
  ): Promise<{
    data: { token: string; expires_at: string; path?: string } | null;
    error: ApiError | null;
  }> {
    const res = await request<{ token: string; expires_at: string; path?: string }>(
      this.ctx(),
      "POST",
      `/v1/images/${encodeURIComponent(id)}/sign`,
      {
        body: {
          tier: options.tier ?? "md",
          format: options.format ?? "webp",
          ttl_seconds: options.ttl_seconds ?? 3600,
        },
      },
    );
    return { data: res.data ?? null, error: res.error };
  }

  /**
   * Absolute or path URL for a variant. For signed visibility, pass token from sign().
   */
  url(id: string, options: ImageUrlOptions = {}): string {
    const ctx = this.ctx();
    const base = ctx.options.url.replace(/\/+$/, "");
    if (options.token) {
      return `${base}/v1/images/download?token=${encodeURIComponent(options.token)}`;
    }
    const tier = options.tier ?? "md";
    const format = options.format ?? "webp";
    return `${base}/v1/images/${encodeURIComponent(id)}/variants/${encodeURIComponent(tier)}/${encodeURIComponent(format)}`;
  }
}
