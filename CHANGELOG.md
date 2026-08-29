# Changelog

All notable changes to aether-packages will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-08-29

### Fixed

- **`@aetherAssembly/ui`:** `styles.css` previously shipped only `--ae-*` design
  token declarations with no actual component rules — every `Button`, `Card`,
  `Modal`, `Input`, and `Badge` rendered as unstyled HTML in any app consuming
  the package. Added the missing component CSS (variants, sizes, hover/focus/
  disabled states, the `Button` loading spinner, and the native `<dialog>`
  backdrop for `Modal`), built from the existing tokens.
- **Toolchain:** downgraded root `typescript` from `^7.0.2` to `^6.0.3`.
  `@typescript-eslint/eslint-plugin`/`parser` (`^8.67.0`, currently no release
  supports TS 7 as a peer — latest is `8.68.0`, still capped at `typescript
  <6.1.0`) made `npm ci` fail with an unresolvable `ERESOLVE` peer conflict on
  every install, which had been silently failing CI on `main` and every open
  dependency PR since TypeScript was bumped to 7.x.

## [1.0.2] - 2026-07-20

### Changed

- Bumped devDependencies: `@typescript-eslint/eslint-plugin`/`parser` to
  `^8.64.0`, `eslint` to `^10.7.0`, `prettier` to `^3.9.5`, `vitest` and
  `@vitest/coverage-v8` to `^4.1.10`.
- Bumped `@aetherAssembly/core` and `@aetherAssembly/ui` from `1.0.1` to
  `1.0.2` (no functional changes to either package).

## [1.0.1] - 2026-06-25

### Added

- **`@aetherAssembly/core`:** `LocalStorageAdapter` now accepts an `onError` callback via its second constructor argument (`options.onError`). Called with the caught error when `localStorage.setItem` throws (e.g. `QuotaExceededError`); previously the error was silently swallowed with no way for callers to detect it.
- **`@aetherAssembly/core`:** Tests for `LocalStorageAdapter` covering CRUD, prefix scoping, SSR no-op behavior, and the `onError` callback. All 22 tests pass.

### Fixed

- **`@aetherAssembly/core`:** `IDBAdapter` now throws a clear error at construction time when `indexedDB` is not available (Node.js / SSR), rather than propagating an opaque failure from the `idb` library later.
- **`@aetherAssembly/ui`:** Removed unused `@aetherAssembly/core` dependency — none of the UI components import from it.

### Changed

- Updated README: added CSS import instruction, peer dependency note, full token group table, `className` prop mention, `Modal` title-less close note, and links to `CHANGELOG.md` and `CONTRIBUTING.md`.

## [1.0.0] - 2026-06-19

### Added

- **`@aetherAssembly/core`:** initial release.
  - `StorageAdapter` interface — unified async `get/set/delete/clear/keys` contract shared across all adapter implementations.
  - `IDBAdapter` — IndexedDB-backed key-value store using `idb`. Takes a database name and object store name; the store is created automatically on first open.
  - `LocalStorageAdapter` — async wrapper around `localStorage` with an optional key prefix for scoping. Gracefully no-ops when `localStorage` is unavailable (SSR, Web Workers).
  - `MemoryAdapter` — Map-backed in-memory adapter for use in unit tests.
  - Shared TypeScript types: `ID`, `Timestamp`, `Nullable<T>`, `Optional<T>`, `BaseEntity`.
- **`@aetherAssembly/ui`:** initial release.
  - `Button` — `variant`: `primary | secondary | ghost | danger`; `size`: `sm | md | lg`; `loading` prop shows a spinner and disables the button.
  - `Card` — `header` and `footer` ReactNode slots.
  - `Badge` — `variant`: `default | success | warning | danger | info`.
  - `Input` — `label`, `error` (sets `aria-invalid`), and `hint` props; auto-generates an `id` from the label.
  - `Modal` — wraps the native `<dialog>` element with `showModal()` / `close()`.
  - `styles.css` — default `--ae-*` CSS custom property tokens for theming (colors, spacing, radii, shadows).
- **Monorepo tooling:** npm workspaces, TypeScript composite build (`tsc --build`), Vitest with passing tests for `MemoryAdapter`.
- **CI workflow** (`.github/workflows/ci.yml`): runs typecheck, build, and tests on every push and PR to `main`.
- **Publish workflow** (`.github/workflows/publish.yml`): publishes both packages to the GitHub Package Registry on `v*` tag push.
- **`.npmrc`:** scopes `@aetherAssembly` to `https://npm.pkg.github.com`.
