# Contribute to aether-packages

Thanks for helping improve the shared packages. This guide helps you set up the repository, make a focused change, and run the checks before opening a pull request.

## Set up the repository

You need Node.js 22.22.2+, 24.15+, or 26+. Installing this repository's workspaces does not require a GitHub Packages token. You will need a GitHub token with `read:packages` permission only when installing the published packages from another project. See the [package installation instructions](README.md#install-a-package) for that setup.

Then clone the repository and install its dependencies:

```sh
git clone https://github.com/AetherAssembly/aether-packages
cd aether-packages
npm ci
```

## Find your way around

```text
packages/
  core/         @aetherAssembly/core, storage and shared types
    src/
      storage/  adapters and storage contract tests
      types/    shared TypeScript types
  ui/           @aetherAssembly/ui, React components and styles
    src/
      components/
      styles.css
docs/           usage, API behavior, and release guides
examples/       interactive component gallery
tests/          browser behavior tests
```

Each package is an independent npm workspace. The packages share `tsconfig.base.json`, and each has its own `package.json` and TypeScript configuration. Packages that include tests also have a Vitest configuration.

## Choose the right change

### Add a storage adapter

Every adapter implements `StorageAdapter` from `packages/core/src/storage/adapter.ts`:

```ts
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}
```

Keep the contract consistent so app code can switch adapters without changing its calls:

- Make every method async, including wrappers around synchronous storage.
- Return `null`, not `undefined`, for missing keys.
- Make `clear()` remove only keys owned by the adapter. Respect any configured prefix.
- Return unprefixed keys from `keys()`.
- Reject backend failures unless the adapter has an explicit best-effort option.

To add an adapter:

1. Add `packages/core/src/storage/<name>.ts` and implement `StorageAdapter`.
2. Export the adapter and any public options from `packages/core/src/index.ts`.
3. Add `packages/core/src/storage/<name>.test.ts`. Cover all interface methods, missing keys, empty stores, and backend-specific failures.
4. Run the core tests and the consumer package check.

Use the tests in `packages/core/src/storage/memory.test.ts` as a starting point. Read the [storage guide](docs/storage.md) for value, error, and persistence expectations.

### Add a UI component

To add a component:

1. Create `packages/ui/src/components/<Name>.tsx`.
2. Export the component and its public prop types from `packages/ui/src/index.ts`.
3. Add styles to `packages/ui/src/styles.css`.
4. Add or update tests in `packages/ui/src/components/components.test.tsx`.
5. Add an example to `examples/gallery` when it helps consumers understand the component.

Follow these conventions so the component feels consistent with the rest of the library:

- Extend the relevant native HTML attributes and pass supported props to the root element. This lets consumers use event handlers, `data-*`, and `aria-*` attributes.
- Use `--ae-*` custom properties for colors, spacing, and other visual values. Avoid hardcoded theme values.
- Use `ae-`-prefixed BEM-style classes, such as `ae-btn`, `ae-btn__spinner`, and `ae-btn--primary`.
- Keep component class construction local. The package does not use a shared `cx` utility.
- Use plain CSS rather than CSS Modules or styled-components.
- Give interactive elements accessible names, correct roles, keyboard behavior, and visible focus styles. Follow the native `<dialog>` pattern used by `Modal` for overlays.

See the [UI component guide](docs/ui-components.md) for expected behavior and accessibility details.

### Add another package

Packages under the root `packages/*` workspace pattern are picked up by workspace commands and the publish script. Create a package directory and add a manifest with a unique scoped name:

```json
{
  "name": "@aetherAssembly/<name>",
  "version": "1.0.0",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "scripts": {
    "build": "tsc --build",
    "test": "vitest run"
  }
}
```

Add a `tsconfig.json` that extends `../../tsconfig.base.json`, sets `rootDir` and `outDir`, and declares references to any local package dependencies. Export only the APIs consumers should use from `src/index.ts`.

After adding the package, run `npm install` from the repository root to update workspace links. Then run the build and `npm run test:packages` to check the packed package from a consumer's perspective. See the [publishing guide](docs/publishing.md) before preparing a release.

## Follow the TypeScript settings

The shared `tsconfig.base.json` enables strict checks beyond `strict: true`:

- `exactOptionalPropertyTypes`: omit an optional property instead of passing `undefined`.
- `noUncheckedIndexedAccess`: guard array indexes and object lookups because they may be `undefined`.
- `noImplicitReturns`: return a value on every code path in non-void functions.

The project uses `moduleResolution: bundler`, so local TypeScript imports use `.js` extensions. TypeScript preserves the correct paths in emitted code.

## Run the checks

Tests live beside the source as `*.test.ts` or `*.test.tsx`. Run the full suite before opening a pull request:

```sh
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run test:packages
```

The package check builds temporary tarballs and tests them in a consumer project. To run one package's tests:

```sh
npm --workspace packages/core test
```

For core coverage, use:

```sh
npm --workspace packages/core run test:coverage
```

Use `MemoryAdapter` for tests that only need the `StorageAdapter` contract. Test IndexedDB and localStorage directly when the behavior under test depends on persistence, serialization, or backend errors.

For browser tests, install Chromium once with `npx playwright install chromium`, then run:

```sh
npm run test:browser
```

Run `npm run gallery` to try UI examples in a browser.

## Prepare a release

Packages are versioned independently. Update the version and changelog entry for the package you changed, run the checks above, then follow the [publishing guide](docs/publishing.md). A tag beginning with `v` starts the workflow; it publishes only package versions that are not already in GitHub Packages.
