import { webcrypto } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createClient } from "./client.js";
import { MemoryStorage } from "./storage.js";

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: webcrypto,
  });
}

const user = {
  id: "user-1",
  email: "person@example.com",
  username: null,
  status: "active",
  last_sign_in_at: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("redirect authentication", () => {
  it("correlates PKCE state, exchanges once, scrubs history, and restores the user", async () => {
    const storage = new MemoryStorage();
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/oauth/token"))
        return new Response(
          JSON.stringify({
            access_token: "access",
            refresh_token: "refresh",
            token_type: "Bearer",
            expires_in: 900,
          }),
          { status: 200 },
        );
      return new Response(
        JSON.stringify({
          data: user,
          error: null,
          meta: { request_id: "req" },
        }),
        { status: 200 },
      );
    });
    const client = createClient({
      url: "https://api.example.com",
      projectKey: "pk",
      storage,
      fetch: fetcher as typeof fetch,
    });
    const start = await client.auth.signInWithRedirect({
      clientId: "client-1",
      redirectUri: "https://app.example.com/callback",
      scopes: ["profile", "email"],
    });
    expect(start.error).toBeNull();
    const authorize = new URL(start.data!.url);
    expect(authorize.searchParams.get("code_challenge_method")).toBe("S256");
    expect(
      authorize.searchParams.get("code_challenge")!.length,
    ).toBeGreaterThanOrEqual(43);
    expect(authorize.searchParams.has("client_secret")).toBe(false);
    const replaced: string[] = [];
    const callback = await client.auth.handleRedirectCallback({
      url: `https://app.example.com/callback?code=one-time-code&state=${start.data!.state}`,
      replaceHistory: (value) => replaced.push(value),
    });
    expect(callback.data?.user).toEqual(user);
    expect(replaced[0]).not.toContain("code=");
    expect(replaced[0]).not.toContain("state=");
    expect(String(fetcher.mock.calls[0][0])).toContain("/oauth/token");
    const replay = await client.auth.handleRedirectCallback({
      url: `https://app.example.com/callback?code=replay&state=${start.data!.state}`,
      replaceHistory: () => undefined,
    });
    expect(replay.error?.code).toBe("REDIRECT_STATE_MISMATCH");
  });

  it("keeps simultaneous attempts transaction-scoped and rejects unknown state", async () => {
    const client = createClient({
      url: "https://api.example.com",
      projectKey: "pk",
      storage: new MemoryStorage(),
    });
    const first = await client.auth.signInWithRedirect({
      clientId: "client",
      redirectUri: "https://app.example/callback",
    });
    const second = await client.auth.signInWithRedirect({
      clientId: "client",
      redirectUri: "https://app.example/callback",
    });
    expect(first.data?.state).not.toBe(second.data?.state);
    const mismatch = await client.auth.handleRedirectCallback({
      url: "https://app.example/callback?code=code&state=attacker",
      replaceHistory: () => undefined,
    });
    expect(mismatch.error?.code).toBe("REDIRECT_STATE_MISMATCH");
  });

  it("fails closed when transaction storage is unavailable", async () => {
    const unavailable = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    const client = createClient({
      url: "https://api.example.com",
      projectKey: "pk",
      storage: unavailable,
    });
    const result = await client.auth.signInWithRedirect({
      clientId: "client",
      redirectUri: "https://app.example/callback",
    });
    expect(result.error?.code).toBe("REDIRECT_STORAGE_UNAVAILABLE");
  });
});
