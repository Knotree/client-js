# Changelog

## 0.5.4 — 2026-08-04

- **Account UI cohesion pass.** Collapses three stacked injected theme layers into a single DESIGN_SPEC-aligned graphite shell (fixed nav rail + workspace) with a first-class light mode.
- Prefetches sessions when the account dialog opens so hub “Other devices” metadata is accurate without visiting Sessions first.
- Truncated identity labels expose full values via `title`; two-factor control uses switch semantics on the action row.
- Defensive sessions handling when the list API returns a non-array payload.
- No public API changes.

## 0.5.3 — 2026-07-29

- **Account dashboard redesign.** Replaces the previous account hub cards with a compact graphite application shell matching the account dashboard design specification.
- Adds a dense account summary with joined date, other-device count, and last sign-in metadata.
- Adds accessible account action rows, a real two-factor switch state, responsive mobile layout, visible focus states, and confirmation-gated sign-out.
- No public API changes.

## 0.5.1 — 2026-07-29

- **Account popup redesign (“Identity lattice”).** Cool mist canvas, teal→cyan
  key accent, Outfit display + Source Sans 3 body, and a signature lattice
  rail on the dialog edge. Applies to account settings and auth shells.
- Squircle gradient avatars, elevated nav pills, mesh-washed hub hero, and
  refined primary CTAs with soft accent shadow.
- In-dialog dismissible notices on profile/security/session actions (errors
  as `alert`; success still surfaces via toast for status readers).
- Auth banner always carries the lattice identity strip (even without a
  brand label).
- No public API changes. Class names, `--kt-*` tokens, and
  `KnotreeAppearance` / `data-mode` behavior are unchanged.

## 0.5.0 — 2026-07-28

- **Account popup redesign** with a calm, hairline-driven visual language
  grounded in the host's identity (warm paper canvas, solid indigo accent,
  DM Sans → Inter stack). Removes gradient washes, decorative circles,
  hover lifts, and the close-button spin.
- **First-class light and dark themes.** `data-mode="light"` and
  `data-mode="dark"` force a side; the default `"auto"` follows the user's
  OS via `prefers-color-scheme`. Hosts can match their site theme via
  `appearance={{ mode: "dark" }}`. Backdrop dims deeper in dark mode
  automatically.
- **Signature nav marker.** Active sidebar navigation uses a 2px accent
  hairline at the left edge with no background fill (reads like a
  code-editor tab marker). On mobile, the sidebar collapses to a
  horizontal scroll strip with a soft accent pill for the active item.
- **Monospace OTP inputs** with tabular figures, so the 6-digit
  verification code reads like code. Inline code hints (`<code>`) adopt
  the same monospace stack.
- **Typographic account hub hero.** Replaces the gradient hero with a
  quiet recessed surface; stats sit behind hairline dividers instead of
  glowing on color. Verified badge and "Current session" pill keep their
  meaning without the maximalist treatment.
- **Opinionated dark-mode primary button.** Uses dark ink on light indigo
  (`#8b8bff` / `#0e0e10`) instead of the default white-on-color.
- **Refined inputs, buttons, sections, sessions, toasts, skeletons, and
  confirm dialogs.** Hairline borders and quiet recessed surfaces
  (`--kt-bg-soft`) carry the structure. Focus rings use a 2px accent
  outline; `prefers-reduced-motion` and sticky header behavior are
  preserved.
- **Tighter responsive breakpoints**, including a new `≤400px` step for
  OTP and stat spacing. The mobile bottom-sheet pattern (sidebar →
  horizontal strip, stacked hero, single-column hub, full-width auth
  sheet) is preserved.
- No public API changes. Class names, `--kt-*` token names,
  `appearanceStyle`, and the `data-mode` mechanism are unchanged, so
  existing `KnotreeAppearance` overrides and tests continue to work.

## 0.4.0 — 2026-07-28

- **Account popup UI/UX overhaul** with a new "Overview" hub landing
  view (gradient hero with avatar, name, email, and at-a-glance stats),
  card-based quick actions, and inline 2FA / sign-out shortcuts.
- **New visual language** in `@knotree/client/react` and
  `@knotree/client/react-router`: gradient banner, modern typography,
  elevated cards, and subtle motion (backdrop, sheet, dialog, sheet,
  shimmer, pulse, toast, hub).
- **Dark mode** that follows the user's OS preference by default, with
  an explicit `appearance.mode` (`"light" | `"dark" | "auto"`) override
  and richer `KnotreeAppearance` tokens (accent2, bg-elev, text-strong,
  muted2, border-strong, success, warning, borderRadiusSm/Lg).
- **Toast notifications** (`toast.success`/`toast.error`/`toast.info`) for
  signed-in, account updated, password updated, session revoked, code
  re-sent, and similar events, including an auto-dismiss progress bar
  and an `aria-live` region.
- **Show/hide password toggle** on every password field (sign-in,
  sign-up, change password, reset password) with proper `aria-label`
  flipping, plus **password strength meter** (4-level bar) on
  sign-up and reset.
- **Improved sessions UI**: device-aware icons (phone/tablet/laptop/
  monitor), relative "active N ago" timestamps, full location and
  signed-in-at metadata, and a **search bar** that filters by device,
  app, or location.
- **Better forms**: show/hide password, profile "Reset" button,
  inline confirmations, email validation, and a **"Reset" link** on
  the OTP step that surfaces the destination email inline.
- **Dismissible, icon-led inline notices** with `role="alert"` /
  `role="status"` and accessible close buttons.
- **New `AccountHub` landing view** is the new default `defaultView`
  on `<UserButton />`, with sidebar nav now including Overview,
  Profile, Security, and Sessions (Sessions has a live badge for
  the number of other devices).
- **Two-factor authentication** placeholder card in the hub.
- **Add `passwordStrength`, `relativeTime`, `formatDate`,
  `formatDateTime`, `initialsOf`, `deviceIconName`, `isLikelyEmail`
  utilities** in a new `utils.ts` for downstream applications.

## 0.3.1 — 2026-07-28

- Serialize session refresh across browser tabs with Web Locks when available.
- Retry refreshes safely during the token reuse grace window and cover the
  cross-tab coordination behavior with regression tests.

## 0.3.0 — 2026-07-28

- Add Auth v2 client methods for email OTP verification, OTP resend,
  forgot-password, password reset, and pending-signup recovery.
- Add a built-in React authentication modal with sign-in, sign-up, OTP
  verification, forgot-password, and reset-password flows.
- Make `UserButton` work in both signed-out and signed-in states, opening the
  authentication modal for guests and the account dialog for authenticated
  users.
- Harden session refresh against transient network failures, stale refresh
  responses, and sign-out races while preserving valid local sessions.

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
