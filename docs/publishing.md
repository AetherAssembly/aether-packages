# Publish a package

Use this guide when releasing `@aetherAssembly/core` or `@aetherAssembly/ui`. A tag push starts the release workflow. The workflow checks each workspace's exact package version and publishes only versions that are not already in GitHub Packages.

## What happens after a tag push

The [publish workflow](../.github/workflows/publish.yml) runs for tags matching `v*`. It checks out the repository, sets up Node.js with the GitHub Packages registry, installs dependencies, and runs these checks:

1. Typecheck and lint
2. Build both packages
3. Run unit tests
4. Verify the packed packages in a temporary consumer project
5. Run the browser tests

After the checks pass, `scripts/publish-if-new.mjs` reads each workspace's package name and version. It checks that exact version in `https://npm.pkg.github.com`. An existing version is skipped; a version that is not found is published. Authentication and the write permission come from the workflow's `GITHUB_TOKEN`. Do not add a token to the script or repository files.

This means a release can update one package without trying to republish the other package's existing version. The tag starts the workflow; package versions in the manifests determine what is published.

## Before you release

Use semantic versioning for each package independently. Bumping `@aetherAssembly/core` does not require changing `@aetherAssembly/ui`.

| Change                                                     | Suggested bump                    |
| ---------------------------------------------------------- | --------------------------------- |
| Bug fix without an API change                              | Patch, such as `1.0.0` to `1.0.1` |
| New export, optional prop, or adapter                      | Minor, such as `1.0.0` to `1.1.0` |
| Removed export, renamed prop, or breaking interface change | Major, such as `1.0.0` to `2.0.0` |

Before tagging:

1. Review the intended changes and identify which package versions need to change.
2. Update the version field in each package's `package.json`. The manifest is the source of truth.
3. Add a dated entry to `CHANGELOG.md` using its existing format.
4. Run the release checks listed below and confirm they pass.
5. Commit the release changes, then create and push a tag that starts with `v`.

For example, if only core changed, update only `packages/core/package.json`, then use a tag such as `v1.0.6`. The workflow still checks both packages and skips any version already present in the registry.

```sh
git tag v1.0.6
git push origin v1.0.6
```

Tags such as `core-v1.0.6` do not start the workflow because they do not begin with `v`. A plain tag such as `v1.0.6` is also suitable when both packages have new versions ready.

## Confirm the release

Open the repository's [Actions page](https://github.com/AetherAssembly/aether-packages/actions) and check that the publish workflow completed successfully. Review its output to confirm which package versions were published or skipped. Then check the repository's Packages section to confirm the new versions are available.

If a check fails, fix the reported issue and start a new workflow with a new tag. A published version cannot be overwritten; increment that package's version for a later release.

## Install packages locally

Consumers need a GitHub token with `read:packages` permission. Add the registry scope to the consuming project's `.npmrc`:

```ini
@aetherAssembly:registry=https://npm.pkg.github.com
```

Keep credentials in the user's `~/.npmrc`, not the project:

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` in the shell or CI secret store. A CI workflow can use its `GITHUB_TOKEN` when the repository has `read:packages` permission for the package.

## Add another publishable package

The publish script discovers packages from the root `workspaces` setting. To add a package:

1. Place it under a directory matched by the root workspace pattern.
2. Give its `package.json` a unique package name and a version.
3. Do not set `"private": true` if it should be published.
4. Build distributable output and point `main`, `types`, and `exports` to the files consumers need.
5. Set the package's publish registry to `https://npm.pkg.github.com`.
6. Add the package's usage and release notes to the documentation.

Run the release checks before publishing. `npm run test:packages` packs each workspace into a temporary consumer, checks its declarations, ESM and SSR behavior, stylesheet access, and required files. This local check does not publish packages or verify registry authentication.

## Release readiness

From the repository root, run:

```sh
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run test:packages
npx playwright install chromium
npm run test:browser
```

The workflow repeats these checks before publishing.

Review breaking changes before increasing a major version. In particular, check the storage error policy, Input styling and IDs, the default Button type, and Modal dismissal behavior. Confirm that all included contributions can be offered under MIT before publishing a relicensed release. Existing AGPL release artifacts and third-party dependencies keep their own licenses.
