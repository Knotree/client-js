import { describe, expect, it, vi } from "vitest";
import { ImagesClient } from "./images.js";
import type { RequestContext } from "./http.js";
import type { ResolvedClientOptions } from "./types.js";

function ctx(fetchImpl: typeof fetch, token: string | null = null): () => RequestContext {
  const options: ResolvedClientOptions = {
    url: "https://api.example.com",
    projectKey: "pk_test",
    fetch: fetchImpl,
    storage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    autoRefreshToken: false,
    persistSession: false,
  };
  return () => ({
    options,
    getAccessToken: () => token,
  });
}

function jsonResponse(body: unknown, status = 200) {
  const text = JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => text,
  };
}

describe("ImagesClient", () => {
  it("lists images via GET /v1/images", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: [{ id: "i1", status: "ready", visibility: "public", filename: "a.png" }],
        error: null,
        meta: { request_id: "r1" },
      }),
    );
    const client = new ImagesClient(ctx(fetchMock as unknown as typeof fetch));
    const { data, error } = await client.list({ status: "ready" });
    expect(error).toBeNull();
    expect(data?.[0]?.id).toBe("i1");
    expect(fetchMock).toHaveBeenCalled();
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/v1/images");
    expect(url).toContain("status=ready");
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["X-Project-Key"]).toBe("pk_test");
  });

  it("gets image by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: { id: "i1", status: "ready", visibility: "owner", filename: "x.png" },
        error: null,
        meta: { request_id: "r1" },
      }),
    );
    const client = new ImagesClient(ctx(fetchMock as unknown as typeof fetch));
    const { data, error } = await client.get("i1");
    expect(error).toBeNull();
    expect(data?.id).toBe("i1");
    expect(String(fetchMock.mock.calls[0][0])).toContain("/v1/images/i1");
  });

  it("uploads binary to POST /v1/images", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          data: {
            image: { id: "i2", status: "pending", visibility: "public", filename: "h.png" },
            job: { id: "j1", status: "pending" },
          },
          error: null,
          meta: { request_id: "r1" },
        },
        201,
      ),
    );
    const client = new ImagesClient(ctx(fetchMock as unknown as typeof fetch, "tok"));
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" });
    const { data, error } = await client.upload(blob, {
      visibility: "public",
      filename: "h.png",
      contentType: "image/png",
    });
    expect(error).toBeNull();
    expect(data?.image.id).toBe("i2");
    expect(data?.job.id).toBe("j1");
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/v1/images");
    expect(String(url)).toContain("visibility=public");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.headers["Content-Type"]).toBe("image/png");
  });

  it("builds variant and signed URLs", () => {
    const fetchMock = vi.fn();
    const client = new ImagesClient(ctx(fetchMock as unknown as typeof fetch));
    expect(client.url("i1", { tier: "md", format: "avif" })).toBe(
      "https://api.example.com/v1/images/i1/variants/md/avif",
    );
    expect(client.url("i1", { token: "abc" })).toBe(
      "https://api.example.com/v1/images/download?token=abc",
    );
  });

  it("transforms and removes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            data: {
              image: { id: "i1", status: "processing" },
              job: { id: "j2", status: "pending" },
            },
            error: null,
            meta: { request_id: "r1" },
          },
          201,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: { status: "deleted" },
          error: null,
          meta: { request_id: "r2" },
        }),
      );
    const client = new ImagesClient(ctx(fetchMock as unknown as typeof fetch));
    const t = await client.transform("i1", { rotate: 90 });
    expect(t.error).toBeNull();
    expect(t.data?.job.id).toBe("j2");
    const d = await client.remove("i1");
    expect(d.data?.status).toBe("deleted");
  });
});
