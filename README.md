# @knotree/client

TypeScript client for the TinyBase Backend-as-a-Service API (browser and Node.js 18+).

[Repository](https://github.com/Knotree/client-js) ·
[Issues](https://github.com/Knotree/client-js/issues) · Apache-2.0 license

## Install

```bash
npm install @knotree/client
```

The package is ESM-only and includes TypeScript declarations and source maps.
Use Node.js 18 or newer, or a modern browser bundler.

## Quick start

```ts
import { createClient } from "@knotree/client";

const tinybase = createClient({
  projectKey: "tb_pk_your_project_key",
});

// Auth
const { data: session, error } = await tinybase.auth.signUp({
  email,
  password,
});

// Data
const { data: todos } = await tinybase
  .from("todos")
  .select("id,title,completed")
  .eq("completed", false)
  .order("created_at", { ascending: false })
  .limit(20);

// Invoke a deployed Edge Function. App-user auth is attached when signed in.
const { data: greeting, error: functionError, response } =
  await tinybase.functions.invoke<{ message: string }>("greeting", {
    body: { name: "TinyBase" },
  });
console.log(greeting?.message, response?.invocationId, response?.version);
```

`projectKey` is the project's public `tb_pk_*` key. Never configure this browser client with a `tb_sk_*` service key.

## Identity, ownership, and CORS

The dashboard login is the **platform owner** identity. `tinybase.auth.*` creates and signs in **app users** for one project; the resulting app-user JWT is attached automatically to Data API requests and becomes `auth.uid()` inside PostgreSQL RLS.

For a table protected by `personal_data` or `user_owned`, use a `user_id uuid NOT NULL DEFAULT auth.uid()` column. Authenticated inserts may omit `user_id`: TinyBase injects the current app-user id, while RLS rejects attempts to submit another user's id.

Each browser origin must be added to the project's exact CORS allowlist in the dashboard. An empty allowlist denies browser access. Multiple frontends can share one project, public key, and app-user pool when all of their origins are configured.

## Typed database schema

```ts
type Database = {
  todos: {
    Row: { id: string; user_id: string; title: string; completed: boolean };
    Insert: { title: string; completed?: boolean };
    Update: { title?: string; completed?: boolean };
  };
};

const tinybase = createClient<Database>({ projectKey });
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `url` | `https://tinybaseapis.knotree.com` | Override only for a self-hosted API |
| `projectKey` | required | Public/anon project key (`tb_pk_*`); never a service key |
| `fetch` | `globalThis.fetch` | Custom fetch implementation |
| `storage` | `localStorage` or memory | Session persistence |
| `persistSession` | `true` | Persist session in storage |
| `autoRefreshToken` | `true` | Refresh access token before expiry |

## Edge Functions

Deploy functions from the project dashboard, then invoke them with the public
project key already configured on the client:

```ts
const result = await tinybase.functions.invoke("profile", {
  method: "PUT",
  path: "/users/42",
  query: { notify: "true" },
  headers: { "X-Trace-Source": "settings" },
  body: { displayName: "Tiny" },
});
```

Plain objects are JSON encoded. Strings, `Blob`, `FormData`, `URLSearchParams`,
and binary bodies are sent unchanged. Responses are decoded as JSON when their
content type is JSON and otherwise returned as text. `response` contains the
HTTP status, response headers, durable invocation id, and deployed version.
Non-2xx responses return a typed `error` and do not throw; network failures use
`EDGE_FUNCTION_NETWORK_ERROR`.

## Scripts

```bash
npm test
npm run typecheck
npm run build
npm run verify:package
```

`verify:package` builds the exact npm tarball, checks its required files,
installs it into a temporary consumer project, and verifies the public runtime
exports.

## Release

Releases are published by GitHub Actions through npm Trusted Publishing:

1. Update `version` and `CHANGELOG.md` in a pull request.
2. Merge only after the CI matrix succeeds on Node.js 18, 20, 22, and 24.
3. Create and publish a GitHub Release whose tag is exactly `v<version>`.
4. The `publish.yml` workflow repeats all gates, verifies release identity,
   publishes through short-lived OIDC credentials, and records npm provenance.

No npm write token is stored in GitHub.

See [RELEASING.md](./RELEASING.md) for the complete release runbook, Trusted
Publisher identity, verification commands, and failure recovery.

## Support and security

Report reproducible SDK bugs through the
[GitHub issue tracker](https://github.com/Knotree/client-js/issues). Do not
include project service keys, access tokens, refresh tokens, or user data in an
issue. For security-sensitive reports, use GitHub's private security reporting
for the repository when available.

## Hosted redirect authentication

Register an exact callback in the TinyBase Application (this is separate from
Project CORS), then start a redirect. The SDK creates high-entropy state and
PKCE S256 values and stores each attempt separately:

```ts
const started = await tb.auth.signInWithRedirect({
  clientId: "tb_app_...",
  redirectUri: `${window.location.origin}/auth/callback`,
  scopes: ["profile", "email", "offline_access"],
});
if (started.data) window.location.assign(started.data.url);
```

On the exact callback route:

```ts
const result = await tb.auth.handleRedirectCallback();
if (result.error) {
  // REDIRECT_CANCELLED / STATE_MISMATCH / EXPIRED / EXCHANGE_FAILED are safe to retry.
}
```

The callback validates stored state, consumes the transaction before exchange,
removes code/state/error parameters from browser history, exchanges with the
public client id and PKCE verifier, and persists the normal TinyBase session.
Google authentication still returns through this callback and never bypasses
the Hosted Portal consent page. `auth.signOut()` remains the normal logout;
`auth.revokeToken(token, clientId)` explicitly revokes an OAuth refresh/access
credential. No client secret is accepted by these APIs.

Existing `signIn`/`signUp` password calls are unchanged. Apps migrating to
redirect auth should register their exact production callbacks,
configure CORS independently, handle typed callback errors, and avoid starting
redirect auth where storage is blocked—the SDK fails closed rather than
accepting an uncorrelated code.
