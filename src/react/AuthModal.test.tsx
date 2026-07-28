import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "../client.js";
import { MemoryStorage } from "../storage.js";
import type { ApiResponse, Session } from "../types.js";
import { KnotreeProvider } from "./context.js";
import { UserButton } from "./UserButton.js";

function response<T>(data: T | null, status = 200, error: { code: string; message: string; details?: unknown } | null = null) {
  return new Response(
    JSON.stringify({
      data,
      error,
      meta: { request_id: "req-1" },
    } satisfies ApiResponse<T>),
    { status, headers: { "Content-Type": "application/json" } },
  );
}

afterEach(() => {
  cleanup();
  document.head.querySelector("#knotree-account-ui")?.remove();
  vi.restoreAllMocks();
});

describe("React Auth modal / dual-mode UserButton", () => {
  it("shows skeleton before ready then signed-out Sign in control", async () => {
    let resolveInit: (() => void) | undefined;
    const gate = new Promise<void>((r) => {
      resolveInit = r;
    });
    const storage = new MemoryStorage();
    const client = createClient({
      projectKey: "tb_pk_test",
      storage,
      fetch: vi.fn(async () => response(null)),
      autoRefreshToken: false,
    });
    // Delay initialize by wrapping
    const original = client.auth.initialize.bind(client.auth);
    client.auth.initialize = async () => {
      await gate;
      return original();
    };

    render(
      <KnotreeProvider client={client}>
        <UserButton />
      </KnotreeProvider>,
    );
    expect(document.querySelector(".kt-user-skeleton")).toBeTruthy();
    resolveInit?.();
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(document.querySelector(".kt-user-skeleton")).toBeNull();
  });

  it("opens Auth dialog when signed out and closes on Escape", async () => {
    const client = createClient({
      projectKey: "tb_pk_test",
      storage: new MemoryStorage(),
      fetch: vi.fn(async () => response(null)),
      autoRefreshToken: false,
    });
    render(
      <KnotreeProvider client={client}>
        <UserButton />
      </KnotreeProvider>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("switches to sign-up and OTP after pending signup", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/v1/auth/signup")) {
        return response({
          status: "pending_verification",
          user: {
            id: "u-new",
            email: "new@example.com",
            username: null,
            status: "active",
            email_verified: false,
            last_sign_in_at: null,
            created_at: new Date().toISOString(),
          },
        } as unknown as Session);
      }
      if (url.includes("/v1/auth/otp/verify")) {
        return response({
          access_token: "a",
          refresh_token: "r",
          token_type: "Bearer",
          expires_in: 900,
          user: {
            id: "u-new",
            email: "new@example.com",
            username: null,
            status: "active",
            last_sign_in_at: null,
            created_at: new Date().toISOString(),
          },
        } satisfies Session);
      }
      return response(null, 404, { code: "NOT_FOUND", message: "nope" });
    });
    const client = createClient({
      projectKey: "tb_pk_test",
      storage: new MemoryStorage(),
      fetch: fetchMock as unknown as typeof fetch,
      autoRefreshToken: false,
    });
    render(
      <KnotreeProvider client={client}>
        <UserButton />
      </KnotreeProvider>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Sign in" }));
    fireEvent.click(screen.getByRole("button", { name: "Create an account" }));
    expect(await screen.findByRole("heading", { name: "Create account" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeTruthy();
    // Paste OTP
    const first = screen.getByLabelText("Digit 1");
    fireEvent.paste(first, {
      clipboardData: { getData: () => "123456" },
    } as unknown as React.ClipboardEvent);
    // fill via change simulation for paste handler path
    fireEvent.change(first, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify email" }));
    await waitFor(() => {
      expect(client.auth.getAccessToken()).toBe("a");
    });
  });

  it("signed-in UserButton opens Account profile not Auth", async () => {
    const storage = new MemoryStorage();
    await storage.setItem(
      "tinybase.auth.token",
      JSON.stringify({
        access_token: "access",
        refresh_token: "refresh",
        token_type: "Bearer",
        expires_in: 900,
        expires_at: Date.now() + 900_000,
        user: {
          id: "user-1",
          email: "ada@example.com",
          username: "ada",
          status: "active",
          last_sign_in_at: null,
          created_at: "",
        },
      }),
    );
    const client = createClient({
      projectKey: "tb_pk_test",
      storage,
      fetch: vi.fn(async () => response(null)),
      autoRefreshToken: false,
    });
    render(
      <KnotreeProvider client={client}>
        <UserButton />
      </KnotreeProvider>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Open account settings" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Profile" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Welcome back" })).toBeNull();
  });
});
