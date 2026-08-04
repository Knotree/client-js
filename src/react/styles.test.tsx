import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "../client.js";
import { MemoryStorage } from "../storage.js";
import type { AccountSession, ApiResponse, AppUser, Session } from "../types.js";
import { KnotreeProvider } from "./context.js";
import {
  RESPONSIVE_MAX_WIDTH_PX,
  STYLE_ID,
  accountStyles,
  appearanceStyle,
} from "./styles.js";
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

afterEach(() => {
  cleanup();
  document.head.querySelector(`#${STYLE_ID}`)?.remove();
  vi.restoreAllMocks();
});

describe("accountStyles contract (shipped CSS)", () => {
  it("exports a cohesive token system with signature + responsive + a11y floor", () => {
    expect(accountStyles.length).toBeGreaterThan(1000);
    expect(RESPONSIVE_MAX_WIDTH_PX).toBe(780);

    // Token palette present (instrument-panel graphite + signal blue)
    expect(accountStyles).toContain("--kt-shell-bg:");
    expect(accountStyles).toContain("--kt-accent:");
    expect(accountStyles).toContain("--kt-focus:");
    expect(accountStyles).toContain("--kt-signal:");
    expect(accountStyles).toContain("--kt-touch:");

    // Signature shell treatment (top rim + left signal edge via ::before/::after)
    expect(accountStyles).toMatch(/\.kt-dialog\s*\{/);
    expect(accountStyles).toContain(".kt-dialog::before");
    expect(accountStyles).toContain(".kt-dialog::after");
    expect(accountStyles).toContain("var(--kt-signal)");

    // Focus-visible quality floor
    expect(accountStyles).toContain(":focus-visible");
    expect(accountStyles).toContain("outline:2px solid var(--kt-focus)");

    // Reduced motion quality floor
    expect(accountStyles).toContain("@media(prefers-reduced-motion:reduce)");
    expect(accountStyles).toContain("animation-duration:.01ms!important");
    expect(accountStyles).toContain("transition-duration:.01ms!important");

    // Phone-width breakpoint changes layout (hide rail, show mobile head, sheet)
    expect(accountStyles).toContain(`@media(max-width:${RESPONSIVE_MAX_WIDTH_PX}px)`);
    expect(accountStyles).toMatch(/@media\(max-width:780px\)[\s\S]*\.kt-sidebar\{display:none\}/);
    expect(accountStyles).toMatch(/@media\(max-width:780px\)[\s\S]*\.kt-mobile-head\{[\s\S]*?display:flex/);
    expect(accountStyles).toMatch(/@media\(max-width:780px\)[\s\S]*\.kt-sheet-grip\{[\s\S]*?display:flex/);
    expect(accountStyles).toMatch(/@media\(max-width:780px\)[\s\S]*animation:kt-sheet/);
    expect(accountStyles).toMatch(/@media\(max-width:780px\)[\s\S]*place-items:end center/);

    // Desktop default keeps multi-column shell
    expect(accountStyles).toMatch(
      /\.kt-dialog\{[\s\S]*grid-template-columns:\s*236px minmax\(0,1fr\)/,
    );

    // Touch-sized primary controls
    expect(accountStyles).toContain("min-height:var(--kt-touch)");
    expect(accountStyles).toContain("--kt-touch:44px");

    // Phone layout: dedicated chrome row puts close in normal flow (not over pill nav)
    expect(accountStyles).toContain(".kt-dialog-chrome");
    expect(accountStyles).toMatch(
      /@media\(max-width:780px\)[\s\S]*\.kt-dialog-chrome\{[^}]*position:relative/,
    );
    expect(accountStyles).toMatch(
      /@media\(max-width:780px\)[\s\S]*\.kt-dialog-chrome \.kt-close[\s\S]*position:static/,
    );

    // Pill strip must not flex-shrink / vertically clip touch targets
    expect(accountStyles).toMatch(/\.kt-mobile-head\{[\s\S]*?flex-shrink:0/);
    expect(accountStyles).toMatch(/\.kt-mobile-head\{[\s\S]*?min-height:calc\(var\(--kt-touch\)/);
    expect(accountStyles).toMatch(
      /@media\(max-width:780px\)[\s\S]*\.kt-mobile-head\{[\s\S]*?flex-shrink:0/,
    );
    expect(accountStyles).toMatch(
      /@media\(max-width:780px\)[\s\S]*\.kt-mobile-head\{[\s\S]*?min-height:calc\(var\(--kt-touch\)/,
    );
    expect(accountStyles).toMatch(/\.kt-mobile-head \.kt-nav-button\{[\s\S]*?min-height:var\(--kt-touch\)/);
  });

  it("maps appearance overrides onto public CSS variables", () => {
    const style = appearanceStyle({
      accentColor: "#112233",
      backgroundColor: "#010101",
      borderRadius: 12,
      fontFamily: "Comic Sans MS",
    });
    expect(style).toMatchObject({
      "--kt-accent": "#112233",
      "--kt-bg": "#010101",
      "--kt-shell-bg": "#010101",
      "--kt-radius": "12px",
      "--kt-font": "Comic Sans MS",
    });
  });
});

describe("style injection + mobile structure on real components", () => {
  it("injects STYLE_ID into document head and wires account shell landmarks", async () => {
    const storage = new MemoryStorage();
    await storage.setItem("tinybase.auth.token", JSON.stringify(session));
    const client = createClient({
      projectKey: "tb_pk_test",
      storage,
      fetch: vi.fn<typeof fetch>(async () => response([] as AccountSession[])),
      autoRefreshToken: false,
    });

    render(
      <KnotreeProvider client={client} appearance={{ mode: "dark" }}>
        <UserButton />
      </KnotreeProvider>,
    );

    await screen.findByRole("button", { name: "Open account settings" });

    // Provider injects the real shipped stylesheet once
    const styleEl = document.getElementById(STYLE_ID);
    expect(styleEl).toBeTruthy();
    expect(styleEl?.tagName).toBe("STYLE");
    expect(styleEl?.textContent).toBe(accountStyles);
    expect(styleEl?.textContent).toContain("@media(max-width:780px)");
    expect(styleEl?.textContent).toContain("prefers-reduced-motion:reduce");
    expect(styleEl?.textContent).toContain(":focus-visible");

    const open = screen.getByRole("button", { name: "Open account settings" });
    expect(open.getAttribute("data-signed-in")).toBe("true");
    fireEvent.click(open);

    const dialog = await screen.findByRole("dialog");
    expect(dialog.classList.contains("kt-dialog")).toBe(true);
    expect(dialog.getAttribute("data-layout")).toBe("shell");
    expect(dialog.querySelector(".kt-dialog-chrome")).toBeTruthy();
    expect(dialog.querySelector(".kt-dialog-chrome .kt-sheet-grip")).toBeTruthy();
    expect(dialog.querySelector(".kt-dialog-chrome .kt-close")).toBeTruthy();
    expect(dialog.querySelector(".kt-sidebar")).toBeTruthy();
    expect(dialog.querySelector(".kt-content")).toBeTruthy();
    expect(dialog.querySelector(".kt-mobile-head")).toBeTruthy();
    expect(dialog.querySelector(".kt-summary")).toBeTruthy();
    expect(dialog.querySelectorAll(".kt-mobile-head .kt-nav-button").length).toBeGreaterThanOrEqual(4);
    // Close lives in chrome, not inside the mobile pill strip
    expect(dialog.querySelector(".kt-mobile-head .kt-close")).toBeNull();

    // Mobile head is present in the tree (CSS shows it only at phone width)
    const mobileHead = dialog.querySelector(".kt-mobile-head");
    expect(mobileHead?.getAttribute("aria-label")).toBe("Account settings");

    // Desktop rail remains usable labels
    expect(dialog.querySelector(".kt-sidebar")?.textContent).toContain("Overview");
    expect(dialog.querySelector(".kt-sidebar")?.textContent).toContain("Profile");
  });

  it("opens AuthModal with sheet grip and auth shell from signed-out UserButton", async () => {
    const client = createClient({
      projectKey: "tb_pk_test",
      storage: new MemoryStorage(),
      fetch: vi.fn(async () =>
        new Response(
          JSON.stringify({ data: null, error: null, meta: { request_id: "req-1" } }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
      autoRefreshToken: false,
    });

    render(
      <KnotreeProvider client={client}>
        <UserButton />
      </KnotreeProvider>,
    );

    const signIn = await screen.findByRole("button", { name: "Sign in" });
    expect(signIn.getAttribute("data-signed-in")).toBe("false");
    fireEvent.click(signIn);

    const dialog = await screen.findByRole("dialog");
    expect(dialog.classList.contains("kt-auth-dialog")).toBe(true);
    expect(dialog.getAttribute("data-layout")).toBe("auth-sheet");
    expect(dialog.querySelector(".kt-sheet-grip")).toBeTruthy();
    expect(dialog.querySelector(".kt-auth-shell")).toBeTruthy();
    expect(dialog.querySelector(".kt-auth-body")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeTruthy();
    expect(dialog.querySelector(".kt-auth-form")).toBeTruthy();
    expect(dialog.querySelector('button.kt-primary')?.textContent).toMatch(/Sign in/i);

    // Styles still injected for auth-only path
    expect(document.getElementById(STYLE_ID)?.textContent).toContain(".kt-auth-dialog");
  });
});
