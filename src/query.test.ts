import { describe, expect, it, vi } from "vitest";
import { createClient } from "./client.js";
import { MemoryStorage } from "./storage.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("query builder", () => {
  it("uses the production API by default", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe("https://tinybaseapis.knotree.com/v1/data/todos");
      return jsonResponse({ data: [], error: null, meta: { request_id: "r-prod" } });
    });

    const client = createClient({
      projectKey: "tb_pk_production_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });

    const { error } = await client.from("todos").select();
    expect(error).toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("builds select with filters order limit", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      expect(init?.method).toBe("GET");
      expect(url).toContain("/v1/data/todos");
      expect(url).toContain("select=id%2Ctitle");
      expect(url).toContain("completed=eq.false");
      expect(url).toContain("order=created_at.desc");
      expect(url).toContain("limit=20");
      return jsonResponse({
        data: [{ id: "1", title: "a", completed: false }],
        error: null,
        meta: { request_id: "r1", count: 1 },
      });
    });

    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });

    const { data, error } = await client
      .from("todos")
      .select("id,title")
      .eq("completed", false)
      .order("created_at", { ascending: false })
      .limit(20);

    expect(error).toBeNull();
    expect(data).toEqual([{ id: "1", title: "a", completed: false }]);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)["X-Project-Key"]).toBe("tb_pk_local_test");
  });

  it("select embeds relation syntax in query string", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain("select=");
      expect(decodeURIComponent(url)).toContain("posts(*)");
      return jsonResponse({ data: [{ id: "1", posts: [] }], error: null, meta: { request_id: "r", count: 1 } });
    });
    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });
    const { data, error } = await client.from("users").select("id,posts(*)");
    expect(error).toBeNull();
    expect(data).toEqual([{ id: "1", posts: [] }]);
  });

  it("rpc posts named args to /v1/rpc", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toContain("/v1/rpc/hello");
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify({ name: "world" }));
      return jsonResponse({ data: [{ hello: "world" }], error: null, meta: { request_id: "r", count: 1 } });
    });
    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });
    const { data, error } = await client.rpc("hello", { name: "world" });
    expect(error).toBeNull();
    expect(data).toEqual([{ hello: "world" }]);
  });

  it("inserts and sends JSON body", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        {
          data: { id: "1", title: "Build" },
          error: null,
          meta: { request_id: "r2", count: 1 },
        },
        201,
      ),
    );

    const client = createClient({
      url: "http://localhost:4000/",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });

    const { data, error } = await client.from("todos").insert({ title: "Build" });
    expect(error).toBeNull();
    expect(data).toEqual({ id: "1", title: "Build" });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ title: "Build" }));
  });

  it("insert().select().maybeSingle() stays POST and returns the inserted row", async () => {
    const row = { title: "Calendar", timezone: "Asia/Saigon" };
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify(row));
      expect(String(input)).toContain("returning=representation");
      return jsonResponse(
        {
          data: { id: "setting-1", ...row },
          error: null,
          meta: { request_id: "r-insert-select", count: 1 },
        },
        201,
      );
    });

    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });

    const { data, error } = await client
      .from("user_settings")
      .insert(row)
      .select("*")
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).toEqual({ id: "setting-1", ...row });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("update().eq().select() stays PATCH with representation", async () => {
    const patch = { completed: true };
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("PATCH");
      expect(init?.body).toBe(JSON.stringify(patch));
      expect(String(input)).toContain("id=eq.abc");
      expect(String(input)).toContain("returning=representation");
      return jsonResponse({
        data: [{ id: "abc", completed: true }],
        error: null,
        meta: { request_id: "r-update-select", count: 1 },
      });
    });

    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });

    const { data, error } = await client
      .from("todos")
      .update(patch)
      .eq("id", "abc")
      .select();

    expect(error).toBeNull();
    expect(data).toEqual([{ id: "abc", completed: true }]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("update and delete require filters in query string", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method === "PATCH") {
        expect(url).toContain("id=eq.abc");
        return jsonResponse({ data: [{ id: "abc", completed: true }], error: null, meta: { request_id: "r" } });
      }
      expect(url).toContain("id=eq.abc");
      return jsonResponse({ data: [{ id: "abc" }], error: null, meta: { request_id: "r" } });
    });

    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });

    await client.from("todos").update({ completed: true }).eq("id", "abc");
    await client.from("todos").delete().eq("id", "abc");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("single returns one object or error", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        data: [{ id: "1" }],
        error: null,
        meta: { request_id: "r" },
      }),
    );
    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });
    const { data, error } = await client.from("todos").select("*").eq("id", "1").single();
    expect(error).toBeNull();
    expect(data).toEqual({ id: "1" });
  });

  it("supports in and is filters", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain("id=in.%28a%2Cb%29");
      expect(url).toContain("deleted_at=is.null");
      return jsonResponse({ data: [], error: null, meta: { request_id: "r" } });
    });
    const client = createClient({
      url: "http://localhost:4000",
      projectKey: "tb_pk_local_test",
      fetch: fetchMock as unknown as typeof fetch,
      storage: new MemoryStorage(),
      persistSession: false,
      autoRefreshToken: false,
    });
    await client.from("todos").select("*").in("id", ["a", "b"]).is("deleted_at", null);
  });
});
