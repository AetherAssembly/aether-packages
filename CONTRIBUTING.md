# Contributing to aether-packages

## Setup

You'll need Node.js 22+ and a GitHub personal access token with `read:packages` scope to install dependencies (GitHub Packages requires auth even for public packages).

Add your token to `~/.npmrc`:

```bash
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

Then clone and install:

```sh
git clone https://github.com/AetherAssembly/aether-packages
cd aether-packages
npm install
```

Verify everything works:

```sh
npm run build
npm test
npm run typecheck
```

---

## Project structure

```bash
packages/
  core/         @aetherAssembly/core
    src/
      storage/  StorageAdapter interface + adapters
      types/    shared TypeScript types
    vitest.config.ts
  ui/           @aetherAssembly/ui
    src/
      components/
      styles.css
tsconfig.base.json   shared TS compiler options
```

Each package is an independent npm workspace. They share `tsconfig.base.json` but have their own `tsconfig.json`, `package.json`, and optionally a `vitest.config.ts`.

---

## Adding a new package

1. Create the directory: `packages/<name>/`
2. Add `packages/<name>/package.json`:

```json
{
  "name": "@aetherAssembly/<name>",
  "version": "1.0.0",
  "license": "AGPL-3.0-only",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc --build",
    "test": "vitest run"
  },
  "files": ["dist"]
}
```

3. Add `packages/<name>/tsconfig.json`, extending the base and adding a reference to any local deps:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "references": [
    { "path": "../core" }
  ],
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

4. Create `packages/<name>/src/index.ts` as the public entry point. Only export what consumers should use — keep internals private.

5. Run `npm install` from the repo root so the workspace is linked.

6. Run `npm run build` to verify the composite build resolves correctly.

---

## Adding a new adapter to `@aetherAssembly/core`

All adapters must implement `StorageAdapter` from `./adapter.ts`:

```ts
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}
```

Rules:

- All methods are **async**, even if the underlying storage is synchronous (see `LocalStorageAdapter`). This keeps the interface uniform so callers can swap adapters without changing their code.
- `get` returns `null` for missing keys, never `undefined`.
- `clear()` must only clear keys owned by this adapter instance (e.g. respect a prefix if one is set).
- `keys()` must return only the unscoped keys — strip any prefix before returning.

Steps:

1. Create `packages/core/src/storage/<name>.ts` and implement `StorageAdapter`.
2. Export it from `packages/core/src/index.ts`.
3. Add tests in `packages/core/src/storage/<name>.test.ts`. The `MemoryAdapter` tests in `memory.test.ts` are a good template — cover `get/set/delete/clear/keys` and edge cases like missing keys and empty stores.

See [`docs/storage.md`](docs/storage.md) for the full contract and design rationale.

---

## Adding a new component to `@aetherAssembly/ui`

1. Create `packages/ui/src/components/<Name>.tsx`.
2. Export from `packages/ui/src/index.ts`.

### Component conventions

- Props extend the relevant HTML element's attributes (`ButtonHTMLAttributes`, `InputHTMLAttributes`, etc.) and spread `...props` onto the root element. This lets consumers pass `onClick`, `data-*`, `aria-*` etc. without extra wiring.
- Use `--ae-*` CSS custom properties for all visual styling — no hardcoded colours or spacing values. The full token list is in [`docs/ui-components.md`](docs/ui-components.md).
- BEM-style class names scoped with `ae-`: `ae-<component>`, `ae-<component>__<element>`, `ae-<component>--<modifier>`. Example: `ae-btn`, `ae-btn__spinner`, `ae-btn--primary`.
- Variant and size props map to modifier classes (`ae-btn--primary`, `ae-btn--sm`). Each component is responsible for its own class string — no shared `cx` utility.
- Add styles to `styles.css` under a clearly commented section. Do not use CSS Modules or styled-components — everything is plain CSS custom properties so apps can override freely.
- Accessibility: interactive elements need correct roles, `aria-*` attributes, and keyboard handling. `Modal` uses `<dialog>` + `showModal()` for native focus trapping and `Escape` key support. Follow the same pattern for any overlay component.

---

## TypeScript conventions

`tsconfig.base.json` enables several strict options beyond `strict: true`:

- **`exactOptionalPropertyTypes`** — don't pass `prop: undefined` where the type is `prop?: T`. Either omit the key or provide a value.
- **`noUncheckedIndexedAccess`** — array index and object key access returns `T | undefined`. Always guard or assert.
- **`noImplicitReturns`** — all code paths must return in non-void functions.

`moduleResolution: bundler` is used, so imports of local files use `.js` extensions even though the source is `.ts`. This matches what the TypeScript compiler emits and what bundlers expect.

---

## Testing

Tests live alongside source files (`*.test.ts` / `*.test.tsx`). They are excluded from the TypeScript build output via `tsconfig.json` `exclude`.

Run all tests:

```sh
npm test
```

Run tests for a single package:

```sh
npm --workspace packages/core test
```

Run with coverage:

```sh
npm --workspace packages/core run test -- --coverage
```

Use `MemoryAdapter` in any test that needs a `StorageAdapter` — don't mock `IDBAdapter` or `LocalStorageAdapter`:

```ts
import { MemoryAdapter } from '@aetherAssembly/core'

const storage = new MemoryAdapter()
// test against the real interface
```

---

## Versioning and releases

Both packages are versioned independently. See [`docs/publishing.md`](docs/publishing.md) for the full release process.

In short: bump the version in the relevant `package.json`, add a CHANGELOG entry, commit, tag as `v<version>`, and push the tag. The publish workflow handles the rest.
