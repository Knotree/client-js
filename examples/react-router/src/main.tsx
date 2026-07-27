import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createClient } from "../../../src/client";
import { MemoryStorage } from "../../../src/storage";
import {
  KnotreeRouterProvider,
  UserButton,
} from "../../../src/react-router";
import type { AccountSession, ApiResponse, AppUser, Session } from "../../../src/types";
import "./style.css";

const user: AppUser = {
  id: "demo-user",
  email: "alex@northstar.studio",
  username: "Alex Morgan",
  status: "active",
  last_sign_in_at: new Date().toISOString(),
  created_at: "2026-03-10T08:00:00Z",
};
const session: Session = {
  access_token: "demo-access",
  refresh_token: "demo-refresh",
  token_type: "Bearer",
  expires_in: 3600,
  expires_at: Date.now() + 3_600_000,
  user,
};
const sessions: AccountSession[] = [
  {
    display_id: "current-device",
    current: true,
    application: "Northstar",
    device: "Chrome on Windows",
    network_hint: "Ho Chi Minh City",
    signed_in_at: "2026-07-27T08:00:00Z",
    last_active_at: new Date().toISOString(),
    expires_at: "2026-08-27T08:00:00Z",
  },
  {
    display_id: "mobile-device",
    current: false,
    application: "Northstar",
    device: "Safari on iPhone",
    network_hint: "Da Nang",
    signed_in_at: "2026-07-24T08:00:00Z",
    last_active_at: "2026-07-26T15:30:00Z",
    expires_at: "2026-08-24T08:00:00Z",
  },
];
const storage = new MemoryStorage();
storage.setItem("tinybase.auth.token", JSON.stringify(session));

function envelope<T>(data: T) {
  return new Response(
    JSON.stringify({
      data,
      error: null,
      meta: { request_id: "demo" },
    } satisfies ApiResponse<T>),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

const client = createClient({
  projectKey: "tb_pk_demo",
  storage,
  fetch: async (input, init) => {
    const url = String(input);
    if (url.includes("/sessions/revoke")) return envelope({ status: "revoked" });
    if (url.includes("/sessions")) return envelope(sessions);
    if (url.includes("/user") && init?.method === "PATCH") return envelope(user);
    return envelope({ status: "ok" });
  },
});

function Demo() {
  return (
    <BrowserRouter>
      <KnotreeRouterProvider
        client={client}
        appearance={{ accentColor: "#635bff", borderRadius: 22 }}
      >
        <div className="shell">
          <header>
            <a className="logo" href="/">northstar<span>°</span></a>
            <nav><a href="#work">Work</a><a href="#insights">Insights</a></nav>
            <UserButton />
          </header>
          <main>
            <p className="eyebrow">Workspace overview</p>
            <h1>Good evening, Alex.</h1>
            <p className="lead">Everything your team needs, gathered in one calm place.</p>
            <div className="cards">
              <article><span>Active projects</span><strong>12</strong><small>3 updated today</small></article>
              <article><span>Team members</span><strong>24</strong><small>Across 4 workspaces</small></article>
              <article><span>Storage</span><strong>68%</strong><small>204 GB of 300 GB</small></article>
            </div>
          </main>
        </div>
      </KnotreeRouterProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(<Demo />);
