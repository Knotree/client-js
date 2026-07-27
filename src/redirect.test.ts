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
    expect(callback.data?.oauth_client_id).toBe("client-1");
    expect(replaced[0]).not.toContain("code=");
    expect(replaced[0]).not.toContain("state=");
    expect(String(fetcher.mock.calls[0][0])).toContain("/oauth/token");
    const replay = await client.auth.handleRedirectCallback({
      url: `https://app.example.com/callback?code=replay&state=${start.data!.state}`,
      replaceHistory: () => undefined,
    });
    expect(replay.error?.code).toBe("REDIRECT_STATE_MISMATCH");
  });

  it("restores an expired Hosted Auth session and rotates it through the OAuth refresh grant", async () => {
    const storage = new MemoryStorage();
    await storage.setItem(
      "tinybase.auth.token",
      JSON.stringify({
        access_token: "expired-access",
        refresh_token: "oauth-refresh-1",
        token_type: "Bearer",
        expires_in: 900,
        expires_at: Date.now() - 1_000,
        oauth_client_id: "client-1",
        user,
      }),
    );
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          access_token: "fresh-access",
          refresh_token: "oauth-refresh-2",
          token_type: "Bearer",
          expires_in: 900,
        }),
        { status: 200 },
      ),
    );
    const client = createClient({
      url: "https://api.example.com",
      projectKey: "pk",
      storage,
      fetch: fetcher as typeof fetch,
    });

    await client.auth.initialize();

    expect(client.auth.getSession()).toMatchObject({
      access_token: "fresh-access",
      refresh_token: "oauth-refresh-2",
      oauth_client_id: "client-1",
      user,
    });
    const [url, init] = fetcher.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.example.com/oauth/token");
    expect(init.method).toBe("POST");
    const body = new URLSearchParams(String(init.body));
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("client_id")).toBe("client-1");
    expect(body.get("refresh_token")).toBe("oauth-refresh-1");
  });

  it("revokes a Hosted Auth refresh token through the matching Application on sign-out", async () => {
    const storage = new MemoryStorage();
    await storage.setItem(
      "tinybase.auth.token",
      JSON.stringify({
        access_token: "access",
        refresh_token: "oauth-refresh",
        token_type: "Bearer",
        expires_in: 900,
        expires_at: Date.now() + 900_000,
        oauth_client_id: "client-1",
        user,
      }),
    );
    const fetcher = vi.fn(async () => new Response(null, { status: 204 }));
    const client = createClient({
      url: "https://api.example.com",
      projectKey: "pk",
      storage,
      fetch: fetcher as typeof fetch,
    });
    await client.auth.initialize();

    const result = await client.auth.signOut();

    expect(result.error).toBeNull();
    expect(client.auth.getSession()).toBeNull();
    const [url, init] = fetcher.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.example.com/oauth/revoke");
    const body = new URLSearchParams(String(init.body));
    expect(body.get("client_id")).toBe("client-1");
    expect(body.get("token")).toBe("oauth-refresh");
  });

  it("restores a still-valid Hosted Auth access-only session without forcing a new login", async () => {
    const storage = new MemoryStorage();
    await storage.setItem(
      "tinybase.auth.token",
      JSON.stringify({
        access_token: "access-only",
        refresh_token: "",
        token_type: "Bearer",
        expires_in: 900,
        expires_at: Date.now() + 900_000,
        oauth_client_id: "client-1",
        user,
      }),
    );
    const fetcher = vi.fn();
    const client = createClient({
      url: "https://api.example.com",
      projectKey: "pk",
      storage,
      fetch: fetcher as typeof fetch,
    });

    await client.auth.initialize();

    expect(client.auth.getAccessToken()).toBe("access-only");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("coalesces simultaneous Hosted Auth refreshes so a rotating token is used once", async () => {
    const storage = new MemoryStorage();
    await storage.setItem(
      "tinybase.auth.token",
      JSON.stringify({
        access_token: "access",
        refresh_token: "oauth-refresh-1",
        token_type: "Bearer",
        expires_in: 900,
        expires_at: Date.now() + 900_000,
        oauth_client_id: "client-1",
        user,
      }),
    );
    let resolveResponse!: (response: Response) => void;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const fetcher = vi.fn(async () => pendingResponse);
    const client = createClient({
      url: "https://api.example.com",
      projectKey: "pk",
      storage,
      fetch: fetcher as typeof fetch,
    });
    await client.auth.initialize();

    const first = client.auth.refreshSession();
    const second = client.auth.refreshSession();
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    resolveResponse(
      new Response(
        JSON.stringify({
          access_token: "fresh-access",
          refresh_token: "oauth-refresh-2",
          token_type: "Bearer",
          expires_in: 900,
        }),
        { status: 200 },
      ),
    );

    expect((await first).data?.access_token).toBe("fresh-access");
    expect((await second).data?.access_token).toBe("fresh-access");
    expect(fetcher).toHaveBeenCalledTimes(1);
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
