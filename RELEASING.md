# Releasing @knotree/client

All npm releases must be produced by GitHub Actions. Do not run `npm publish`
from a workstation and do not add an npm write token to GitHub.

## Fixed release configuration

- GitHub repository: `Knotree/client-js`
- npm package: `@knotree/client`
- Workflow: `.github/workflows/publish.yml`
- npm Trusted Publisher:
  - Organization/user: `Knotree` (case-sensitive)
  - Repository: `client-js`
  - Workflow: `publish.yml`
  - Environment: empty
  - Permission: `npm publish`
- License: `Apache-2.0`
- Default API: `https://tinybaseapis.knotree.com`

The exact GitHub organization casing matters. A lowercase `knotree` Trusted
Publisher does not match GitHub's `Knotree/client-js` OIDC claim and npm rejects
publication with a misleading `404` response.

## Prepare a release

1. Update `version` in both `package.json` and `package-lock.json`.
2. Add the version and release notes to `CHANGELOG.md`.
3. Run the local gate:

   ```bash
   npm ci
   npm test
   npm run typecheck
   npm run build
   npm run verify:package
   npm run verify:release -- vX.Y.Z
   ```

4. Commit and push to `main`.
5. Wait for the CI matrix to pass on Node.js 18, 20, 22, and 24.

## Publish

Create an annotated tag and a GitHub Release only after CI succeeds:

```bash
git tag -a vX.Y.Z -m "@knotree/client vX.Y.Z"
git push origin vX.Y.Z
gh release create vX.Y.Z \
  --repo Knotree/client-js \
  --title "@knotree/client vX.Y.Z" \
  --generate-notes
```

Publishing the GitHub Release triggers `publish.yml`. The workflow checks out
the release tag, installs a Trusted Publishing-capable npm CLI, repeats every
test/build/package gate, verifies that the tag equals `v<package version>`, and
runs `npm publish` using short-lived OIDC credentials. npm generates provenance
automatically.

## Verify

```bash
gh run list --repo Knotree/client-js --workflow "Publish to npm"
npm view @knotree/client version license repository dist.attestations --json
```

For a full consumer audit, install the exact version in an empty temporary
project, import `createClient` and `DEFAULT_API_URL`, then run:

```bash
npm audit signatures
```

The expected result includes one verified registry signature and one verified
attestation. `DEFAULT_API_URL` must equal
`https://tinybaseapis.knotree.com`.

## Failure recovery

- Never fall back to a workstation token or bypass 2FA.
- If publish returns npm `404`, verify the Trusted Publisher organization
  casing is exactly `Knotree`, then rerun the failed GitHub Actions job.
- If a release version already exists on npm, bump the patch version; npm
  versions are immutable.
- If CI fails on one supported Node.js version, fix compatibility or the test
  environment. Do not remove that version merely to make the matrix green.
