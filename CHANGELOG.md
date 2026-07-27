# Changelog

## 0.2.0 — 2026-07-27

- Add an all-in-one React account UI to the existing package through
  `@knotree/client/react` and `@knotree/client/react-router`.
- Add `KnotreeProvider`, `KnotreeRouterProvider`, `UserButton`, `UserProfile`,
  and `useKnotree` without requiring a profile route or separate Knotree
  package.
- Include responsive desktop dialog and mobile bottom-sheet layouts, built-in
  styling and theme tokens, keyboard focus handling, reduced motion, profile
  editing, password change, session management, and confirmed destructive
  actions.
- Keep React and React Router as peer dependencies so consuming applications
  retain a single framework runtime; the framework-free root SDK remains
  isolated from UI imports.
- Add React DOM integration tests, a production-buildable React Router example,
  and packed-consumer checks for all public subpath exports.

## 0.1.6 — 2026-07-27

- Preserve the Hosted Auth Application client id with persisted SSO sessions.
- Refresh SSO sessions through the OAuth `refresh_token` grant and revoke them
  through the matching Application endpoint instead of using direct-auth
  methods.
- Fix expired-session restoration deadlocking while it waited on its own
  initialization.
- Coalesce concurrent refresh attempts so rotating refresh tokens are submitted
  only once, and retain still-valid access-only sessions across reloads.

## 0.1.5 — 2026-07-27

- Fix `insert().select()`, `update().select()`, and `delete().select()` so
  `select()` requests mutation representation without changing the HTTP method
  to `GET`.
- Restore Supabase-style write-and-return chaining. Before this release,
  chaining `select()` after a mutation accidentally performed a read instead
  of the requested write.
- Add regression coverage for read, insert, and update HTTP methods, mutation
  bodies, filters, and `returning=representation`.

## 0.1.4 — 2026-07-27

- Move npm releases to GitHub Actions Trusted Publishing with short-lived OIDC
  credentials and automatic provenance.
- Test every push and pull request on Node.js 18, 20, 22, and 24.
- Verify package identity, version tag, license, repository, build, tests, and
  packed-consumer behavior before publication.

## 0.1.3 — 2026-07-27

- Default the SDK API base URL to the production deployment at
  `https://tinybaseapis.knotree.com`.
- Make `ClientOptions.url` optional while preserving explicit self-hosted
  overrides.
- Replace local/example values in public setup documentation with production
  configuration.

## 0.1.2 — 2026-07-27

- Change the project and npm package license from MIT to Apache-2.0.
- Include Apache-2.0 LICENSE and NOTICE files in the published tarball.

## 0.1.1 — 2026-07-27

- Move the SDK source to the public `Knotree/client-js` repository.
- Correct npm repository, homepage, issue tracker, and author metadata.
- Add continuous integration, security reporting, and contribution guidance.

## 0.1.0 — 2026-07-27

- Initial public release of the TinyBase JavaScript and TypeScript client.
