// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "./client.js";
import { MemoryStorage } from "./storage.js";

const session = {
  access_token: "access-1",
  refresh_token: "refresh-1",
  token_type: "Bearer",
  expires_in: 900,
  user: {
    id: "u1",
    email: "a@example.com",
    username: null,
    status: "active",
    last_sign_in_at: null,
    created_at: new Date().toISOString(),
  },
};

describe("first-party Google authentication", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses Project Google popup without Hosted Auth consent", async () => {
    const popup = {
      closed: false,
      close: vi.fn(),
      location: {} as Location,
    } as Window;
    Object.defineProperty(popup.location, "href", {
      set: () => {
        setTimeout(() => {
          window.dispatchEvent(new MessageEvent("message", {
            origin: "https://app.example.com",
            source: popup,
            data: { type: "google_result", session },
          }));
        }, 0);
      },
    });
    vi.spyOn(window, "open").mockReturnValue(popup);
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      expect(String(input)).toContain("/v1/auth/google/start");
      return new Response(JSON.stringify({
        data: { authorization_url: "https://accounts.google.com/auth" },
        error: null,
        meta: { request_id: "google-start" },
      }), { status: 200 });
    });
    const client = createClient({
      url: "https://api.example.com",
      projectKey: "tb_pk_local_test",
      fetch: fetcher as unknown as typeof fetch,
      storage: new MemoryStorage(),
      autoRefreshToken: false,
    });
    const result = await client.auth.signInWithGoogle({
      returnUri: "https://app.example.com/auth/callback",
    });
    expect(result.error).toBeNull();
    expect(result.data?.access_token).toBe("access-1");
    expect(String(fetcher.mock.calls[0]?.[1]?.body)).not.toContain("client_id");
  });
});
