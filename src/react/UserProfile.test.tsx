import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "../client.js";
import { MemoryStorage } from "../storage.js";
import type { AccountSession, ApiResponse, AppUser, Session } from "../types.js";
import { KnotreeProvider } from "./context.js";
import { UserButton } from "./UserButton.js";

const user: AppUser = {
  id: "user-1",
  email: "ada@example.com",
  username: "ada",
  status: "active",
  last_sign_in_at: "2026-07-27T10:00:00Z",
  created_at: "2026-07-20T10:00:00Z",
};

const session: Session = {
  access_token: "access",
  refresh_token: "refresh",
  token_type: "Bearer",
  expires_in: 900,
  expires_at: Date.now() + 900_000,
  user,
};

function response<T>(data: T, status = 200) {
  return new Response(
    JSON.stringify({
      data,
      error: null,
      meta: { request_id: "req-1" },
    } satisfies ApiResponse<T>),
    { status, headers: { "Content-Type": "application/json" } },
  );
}

async function setup(fetcher: typeof fetch, onAfterSignOut?: () => void) {
  const storage = new MemoryStorage();
  await storage.setItem("tinybase.auth.token", JSON.stringify(session));
  const client = createClient({
    projectKey: "tb_pk_test",
    storage,
    fetch: fetcher,
  });
  render(
    <KnotreeProvider client={client} onAfterSignOut={onAfterSignOut}>
      <UserButton />
    </KnotreeProvider>,
  );
  await screen.findByRole("button", { name: "Open account settings" });
  return client;
}

afterEach(() => {
  cleanup();
  document.head.querySelector("#knotree-account-ui")?.remove();
  vi.restoreAllMocks();
});

describe("React account UI", () => {
  it("opens a route-free dialog and updates the user profile", async () => {
    const fetcher = vi.fn<typeof fetch>(async (_input, init) => {
      expect(init?.method).toBe("PATCH");
      return response({ ...user, username: "ada-lovelace" });
    });
    await setup(fetcher);
    fireEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    // The account hub is the default landing; navigate to Profile.
    fireEvent.click(screen.getAllByRole("button", { name: "Profile" })[0]!);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "ada-lovelace" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect((await screen.findByRole("status")).textContent).toContain("Profile updated.");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("loads sessions and revokes another device after confirmation-free row action", async () => {
    const sessions: AccountSession[] = [
      {
        display_id: "current",
        current: true,
        device: "Chrome on macOS",
        signed_in_at: "2026-07-27T10:00:00Z",
        last_active_at: "2026-07-27T11:00:00Z",
        expires_at: "2026-08-27T10:00:00Z",
      },
      {
        display_id: "other",
        current: false,
        device: "Safari on iPhone",
        signed_in_at: "2026-07-26T10:00:00Z",
        last_active_at: "2026-07-26T11:00:00Z",
        expires_at: "2026-08-26T10:00:00Z",
      },
    ];
    let listed = 0;
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      if (String(input).includes("/sessions/revoke")) return response({ status: "revoked" });
      if (init?.method === "GET") {
        listed++;
        return response(listed === 1 ? sessions : sessions.slice(0, 1));
      }
      throw new Error("unexpected request");
    });
    await setup(fetcher);
    fireEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Sessions" })[0]!);
    expect(await screen.findByText("Safari on iPhone")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Sign out" }).at(-1)!);
    expect(screen.getByText("Sign out Safari on iPhone?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Confirm sign out" }));
    expect((await screen.findByRole("status")).textContent).toContain("Session signed out.");
    await waitFor(() => expect(screen.queryByText("Safari on iPhone")).toBeNull());
  });

  it("traps the modal lifecycle and closes on Escape", async () => {
    await setup(vi.fn<typeof fetch>());
    fireEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("lands on the account hub with hero and quick actions", async () => {
    await setup(vi.fn<typeof fetch>());
    fireEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.querySelector(".kt-hub-hero")).toBeTruthy();
    expect(dialog.querySelector(".kt-hub-grid")).toBeTruthy();
    expect(dialog.querySelectorAll(".kt-hub-card")).toHaveLength(3);
    expect(dialog.querySelectorAll(".kt-hub-list-item")).toHaveLength(2);
    // Verify quick-action card titles are rendered
    expect(dialog.querySelector(".kt-hub-grid")?.textContent).toContain("Edit profile");
    expect(dialog.querySelector(".kt-hub-grid")?.textContent).toContain("Password & security");
    expect(dialog.querySelector(".kt-hub-grid")?.textContent).toContain("Active sessions");
    expect(dialog.querySelector(".kt-hub-list")?.textContent).toContain(
      "Two-factor authentication",
    );
    expect(dialog.querySelector(".kt-hub-list")?.textContent).toContain("Sign out of this device");
  });

  it("respects appearance.mode override and password show/hide toggle", async () => {
    const storage = new MemoryStorage();
    await storage.setItem("tinybase.auth.token", JSON.stringify(session));
    const client = createClient({
      projectKey: "tb_pk_test",
      storage,
      fetch: vi.fn<typeof fetch>(async () => response(null)),
    });
    render(
      <KnotreeProvider client={client} appearance={{ mode: "dark" }}>
        <UserButton />
      </KnotreeProvider>,
    );
    // Wait until the skeleton is replaced with the real user button.
    const open = await screen.findByRole("button", { name: "Open account settings" });
    fireEvent.click(open);
    const dialog = await screen.findByRole("dialog");
    const root = dialog.closest(".kt-root");
    expect(root?.getAttribute("data-mode")).toBe("dark");

    // Navigate to security and toggle password visibility
    fireEvent.click(screen.getAllByRole("button", { name: "Security" })[0]!);
    const showButton = await screen.findByRole("button", { name: /Show current password/ });
    fireEvent.click(showButton);
    expect(screen.getByRole("button", { name: /Hide current password/ })).toBeTruthy();
    const currentInput = screen.getByLabelText("Current password");
    expect((currentInput as HTMLInputElement).type).toBe("text");
  });
});
