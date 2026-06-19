# Publishing

Both packages are published to the [GitHub Package Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) under the `@aetherAssembly` scope. Publishing is fully automated — pushing a version tag triggers the workflow.

---

## How the publish workflow works

`.github/workflows/publish.yml` runs on any tag matching `v*`:

1. Checks out the repo
2. Sets up Node 22 with `registry-url: https://npm.pkg.github.com` and `scope: @aetherAssembly`
3. Runs `npm ci`
4. Runs `npm run build` (TypeScript composite build across all packages)
5. Runs `npm test`
6. Runs `npm publish --workspaces --access public`

The `NODE_AUTH_TOKEN` is set to `${{ secrets.GITHUB_TOKEN }}`, which is provided automatically by GitHub Actions — no manual secret setup required for publishing.

If build or tests fail, the publish step never runs.

---

## Versioning strategy

Packages are versioned independently — bumping `@aetherAssembly/core` does not require bumping `@aetherAssembly/ui`. Use [semantic versioning](https://semver.org/):

| Change | Version bump |
| - | - |
| Bug fix, no API change | Patch (`1.0.0` → `1.0.1`) |
| New export, new optional prop, new adapter | Minor (`1.0.0` → `1.1.0`) |
| Removed export, renamed prop, breaking interface change | Major (`1.0.0` → `2.0.0`) |

Because downstream apps (`Before It's Gone`, `Attyre`) pin to `^1.0.0`, a major bump requires manually updating their `package.json` and migrating any breaking call sites before cutting the release.

---

## Release process

### 1. Bump the version

Edit the relevant `package.json`:

```sh
# for a patch release of core
npm version patch --workspace packages/core
```

Or edit manually. The version in `package.json` is the source of truth.

### 2. Update the changelog

Add an entry to `CHANGELOG.md` following the existing format. The date should be today's date in `YYYY-MM-DD`.

### 3. Commit

```sh
git add packages/core/package.json CHANGELOG.md
git commit -m "chore(core): release v1.0.1"
```

### 4. Tag and push

The tag format is `v<version>`. If you're releasing only one package, use a package-scoped tag to make it clear:

```sh
git tag core-v1.0.1
git push origin core-v1.0.1
```

Or use a plain `v*` tag if both packages are releasing together:

```sh
git tag v1.1.0
git push origin v1.1.0
```

Both formats match the `v*` trigger in the publish workflow.

### 5. Verify

Go to the [Actions tab](https://github.com/AetherAssembly/aether-packages/actions) and confirm the publish workflow completes. The package will appear under the repo's **Packages** section on GitHub.

---

## Auth for local development

To install these packages in another repo locally, you need a GitHub personal access token with `read:packages` scope. Add it to `~/.npmrc` (not the project's `.npmrc` — never commit credentials):

```bash
//npm.pkg.github.com/:_authToken=YOUR_TOKEN_HERE
```

CI pipelines that install these packages need `NODE_AUTH_TOKEN` set as a secret (or use the built-in `GITHUB_TOKEN` if the consuming repo is within the same organisation and has `read:packages` permission).

---

## Adding a new package to the publish workflow

`npm publish --workspaces` publishes every workspace package whose `package.json` does not have `"private": true`. To add a new package to the publish pipeline:

1. Make sure `"private": true` is **not** set in its `package.json`.
2. Set `"files": ["dist"]` so only built output is included in the published artifact.
3. Ensure `"main"`, `"types"`, and `"exports"` all point into `dist/`.

The workflow will pick it up automatically on the next tag push.

To exclude a package from publishing (e.g. an internal tooling package), add `"private": true` to its `package.json`.
