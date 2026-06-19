# Changelog

All notable changes to aether-packages will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
