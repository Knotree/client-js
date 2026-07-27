# Changelog

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
