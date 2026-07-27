import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "../client.js";
import { MemoryStorage } from "../storage.js";
import type { ApiResponse, Session } from "../types.js";
import { KnotreeRouterProvider, UserButton } from "./index.js";

function Location() {
  return <output>{useLocation().pathname}</output>;
}

afterEach(() => cleanup());

describe("KnotreeRouterProvider", () => {
  it("navigates to the configured path after sign out", async () => {
    const stored: Session = {
      access_token: "access",
      refresh_token: "refresh",
      token_type: "Bearer",
      expires_in: 900,
      expires_at: Date.now() + 900_000,
      user: {
        id: "u1",
        email: "user@example.com",
        username: "user",
        status: "active",
        last_sign_in_at: null,
        created_at: "2026-07-27T00:00:00Z",
      },
    };
    const storage = new MemoryStorage();
    await storage.setItem("tinybase.auth.token", JSON.stringify(stored));
    const payload: ApiResponse<{ status: string }> = {
      data: { status: "signed_out" },
      error: null,
      meta: { request_id: "req" },
    };
    const fetcher = vi.fn<typeof fetch>(async () =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createClient({ projectKey: "tb_pk_test", storage, fetch: fetcher });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="*"
            element={
              <KnotreeRouterProvider client={client} afterSignOutPath="/login">
                <UserButton />
                <Location />
              </KnotreeRouterProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Open account settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByText("/login")).toBeTruthy();
  });
});
