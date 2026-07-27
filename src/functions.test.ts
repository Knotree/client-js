import { describe, expect, it, vi } from "vitest";
import { createClient } from "./client.js";

describe("Edge Functions client", () => {
  it("invokes a nested function path and exposes deployment metadata", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/functions/greeting/users/42");
      expect(url.searchParams.get("verbose")).toBe("true");
      expect(init?.method).toBe("PUT");
      expect(init?.headers).toMatchObject({
        "X-Project-Key": "tb_pk_test",
        "Content-Type": "application/json",
      });
      expect(init?.body).toBe('{"name":"TinyBase"}');
      return new Response('{"message":"hello"}', {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "X-Edge-Invocation-Id": "inv-1",
          "X-Edge-Function-Version": "3",
        },
      });
    });
    const client = createClient({
      url: "https://api.example.com/",
      projectKey: "tb_pk_test",
      fetch: fetcher as typeof fetch,
    });

    const result = await client.functions.invoke<{ message: string }>("greeting", {
      method: "put",
      path: "/users/42",
      query: { verbose: "true" },
      body: { name: "TinyBase" },
    });

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ message: "hello" });
    expect(result.response).toMatchObject({ status: 201, invocationId: "inv-1", version: 3 });
  });

  it("returns TinyBase execution errors without throwing", async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: null,
          error: { code: "EDGE_FUNCTION_TIMEOUT", message: "edge function execution failed" },
          meta: { request_id: "req-1" },
        }),
        { status: 504, headers: { "Content-Type": "application/json" } },
      ),
    );
    const client = createClient({ url: "https://api.example.com", projectKey: "tb_pk_test", fetch: fetcher as typeof fetch });

    const result = await client.functions.invoke("slow");

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("EDGE_FUNCTION_TIMEOUT");
    expect(result.response?.status).toBe(504);
  });

  it("rejects invalid slugs before making a request", async () => {
    const fetcher = vi.fn();
    const client = createClient({ url: "https://api.example.com", projectKey: "tb_pk_test", fetch: fetcher as typeof fetch });
    const result = await client.functions.invoke("../secret");
    expect(result.error?.code).toBe("INVALID_REQUEST");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
