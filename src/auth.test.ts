import { describe, expect, it, vi } from "vitest";
import { createClient } from "./client.js";
import { MemoryStorage } from "./storage.js";
import type { Session } from "./types.js";

function session(partial?: Partial<Session>): Session {
  return {
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
    ...partial,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("auth client", () => {
  it("signIn stores session and emits SIGNED_IN", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ data: session(), error: null, meta: { request_id: "r" } }),
    );
    const storage = new MemoryStorage();
    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage,
      autoRefreshToken: false,
    });

    const events: string[] = [];
    client.auth.onAuthStateChange((e) => events.push(e));

    const { data, error } = await client.auth.signIn({
      email: "a@example.com",
      password: "password123",
    });
    expect(error).toBeNull();
    expect(data?.access_token).toBe("access-1");
    expect(client.auth.getAccessToken()).toBe("access-1");
    expect(events).toContain("SIGNED_IN");
    expect(storage.getItem("tinybase.auth.token")).toContain("access-1");
  });

  it("restores session from storage", async () => {
    const storage = new MemoryStorage();
    storage.setItem("tinybase.auth.token", JSON.stringify(session({ expires_at: Date.now() + 60_000 })));

    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: vi.fn() as unknown as typeof fetch,
      storage,
      autoRefreshToken: false,
    });
    await client.auth.initialize();
    expect(client.auth.getAccessToken()).toBe("access-1");
  });

  it("attaches bearer token on authenticated requests", async () => {
    const storage = new MemoryStorage();
    storage.setItem("tinybase.auth.token", JSON.stringify(session({ expires_at: Date.now() + 60_000 })));

    const fetchMock = vi.fn(async () =>
      jsonResponse({
        data: { id: "u1", email: "a@example.com", username: null, status: "active", last_sign_in_at: null, created_at: "" },
        error: null,
        meta: { request_id: "r" },
      }),
    );

    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage,
      autoRefreshToken: false,
    });
    await client.auth.initialize();
    await client.auth.getUser();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer access-1");
  });

  it("refreshes on 401 and retries", async () => {
    let calls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/v1/auth/refresh")) {
        return jsonResponse({
          data: session({ access_token: "access-2", refresh_token: "refresh-2" }),
          error: null,
          meta: { request_id: "r" },
        });
      }
      calls += 1;
      if (calls === 1) {
        return jsonResponse(
          { data: null, error: { code: "TOKEN_EXPIRED", message: "expired" }, meta: { request_id: "r" } },
          401,
        );
      }
      return jsonResponse({
        data: [{ id: "1" }],
        error: null,
        meta: { request_id: "r" },
      });
    });

    const storage = new MemoryStorage();
    storage.setItem("tinybase.auth.token", JSON.stringify(session({ expires_at: Date.now() + 60_000 })));

    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage,
      autoRefreshToken: false,
    });
    await client.auth.initialize();

    const { data, error } = await client.from("todos").select("*");
    expect(error).toBeNull();
    expect(data).toEqual([{ id: "1" }]);
    expect(client.auth.getAccessToken()).toBe("access-2");
  });

  it("signOut clears session", async () => {
    const storage = new MemoryStorage();
    storage.setItem("tinybase.auth.token", JSON.stringify(session({ expires_at: Date.now() + 60_000 })));
    const fetchMock = vi.fn(async () =>
      jsonResponse({ data: { status: "signed_out" }, error: null, meta: { request_id: "r" } }),
    );
    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage,
      autoRefreshToken: false,
    });
    await client.auth.initialize();
    await client.auth.signOut();
    expect(client.auth.getAccessToken()).toBeNull();
    expect(storage.getItem("tinybase.auth.token")).toBeNull();
  });

  it("updateUser patches /v1/auth/user and emits USER_UPDATED", async () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "tinybase.auth.token",
      JSON.stringify(session({ expires_at: Date.now() + 60_000 })),
    );
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        data: {
          id: "u1",
          email: "new@example.com",
          username: "newuser",
          status: "active",
          last_sign_in_at: null,
          created_at: "",
        },
        error: null,
        meta: { request_id: "r" },
      }),
    );
    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage,
      autoRefreshToken: false,
    });
    await client.auth.initialize();
    const events: string[] = [];
    client.auth.onAuthStateChange((e) => events.push(e));
    const { data, error } = await client.auth.updateUser({
      email: "new@example.com",
      username: "newuser",
    });
    expect(error).toBeNull();
    expect(data?.email).toBe("new@example.com");
    expect(data?.username).toBe("newuser");
    expect(events).toContain("USER_UPDATED");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v1/auth/user");
    expect(init.method).toBe("PATCH");
  });

  it("changePassword posts to /v1/auth/change-password and clears local session", async () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "tinybase.auth.token",
      JSON.stringify(session({ expires_at: Date.now() + 60_000 })),
    );
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        data: { status: "password_changed" },
        error: null,
        meta: { request_id: "r" },
      }),
    );
    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage,
      autoRefreshToken: false,
    });
    await client.auth.initialize();
    const { data, error } = await client.auth.changePassword({
      currentPassword: "password123",
      newPassword: "password456",
    });
    expect(error).toBeNull();
    expect(data?.status).toBe("password_changed");
    expect(client.auth.getAccessToken()).toBeNull();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v1/auth/change-password");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      current_password: "password123",
      new_password: "password456",
    });
  });

  it("listSessions and revokeSessions call Project account session routes", async () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "tinybase.auth.token",
      JSON.stringify(session({ expires_at: Date.now() + 60_000 })),
    );
    const sessions = [
      {
        display_id: "abc1234567890def",
        current: true,
        device: "Chrome on Windows",
        signed_in_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
    ];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/v1/auth/sessions/revoke")) {
        return jsonResponse({
          data: { status: "revoked" },
          error: null,
          meta: { request_id: "r" },
        });
      }
      if (url.includes("/v1/auth/sessions")) {
        return jsonResponse({
          data: sessions,
          error: null,
          meta: { request_id: "r" },
        });
      }
      return jsonResponse({ data: null, error: { code: "NOT_FOUND", message: "nope" }, meta: { request_id: "r" } }, 404);
    });
    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage,
      autoRefreshToken: false,
    });
    await client.auth.initialize();
    const listed = await client.auth.listSessions();
    expect(listed.error).toBeNull();
    expect(listed.data?.[0]?.display_id).toBe("abc1234567890def");
    expect(String(fetchMock.mock.calls[0][0])).toContain("refresh_token=refresh-1");

    const revoked = await client.auth.revokeSessions({ mode: "others" });
    expect(revoked.error).toBeNull();
    expect(client.auth.getAccessToken()).toBe("access-1");
    const revokeInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(String(revokeInit.body))).toMatchObject({
      mode: "others",
      refresh_token: "refresh-1",
    });

    await client.auth.revokeSessions({ mode: "all" });
    expect(client.auth.getAccessToken()).toBeNull();
  });
});
