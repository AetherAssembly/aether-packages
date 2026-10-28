# aether-packages

Shared packages for the AetherAssembly ecosystem, published to the GitHub Package Registry under `@aetherAssembly`.

| Package | Description |
| - | - |
| [`@aetherAssembly/core`](./packages/core) | Storage adapters and shared TypeScript types |
| [`@aetherAssembly/ui`](./packages/ui) | React 19 component library |

Consumed by [Driftleaf](https://github.com/AetherAssembly/Driftleaf).

---

## Installation

Add to your project's `.npmrc` to route the scope to GitHub Packages:

```ini
@aetherAssembly:registry=https://npm.pkg.github.com
```

Then install:

```sh
npm install @aetherAssembly/core
npm install @aetherAssembly/ui   # React 19 apps only — peer dep: react@^19
```

> **Auth:** GitHub Packages requires a personal access token with `read:packages` scope set as `NODE_AUTH_TOKEN`, even for public packages. Add it to your shell profile or CI secrets.

---

## `@aetherAssembly/core`

### Storage adapters

All three adapters implement the same async `StorageAdapter` interface — swap them without changing call sites.

```ts
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}
```

#### `IDBAdapter` — IndexedDB

Best choice for browsers. Backed by the [`idb`](https://github.com/jakearchibald/idb) library. Pass a database name and object store name; the store is created on first open.

```ts
import { IDBAdapter } from '@aetherAssembly/core'

const storage = new IDBAdapter('my-app', 'items')

await storage.set('theme', 'dark')
const theme = await storage.get<string>('theme') // 'dark'
await storage.keys()                             // ['theme']
await storage.delete('theme')
await storage.clear()
```

#### `LocalStorageAdapter` — localStorage

Async wrapper around `localStorage`. Rejects failures by default, including unavailable storage. Pass `{ errorMode: 'ignore' }` as the second constructor argument to opt into best-effort behavior. An optional prefix scopes all keys — `clear()` and `keys()` only touch keys within that prefix.

```ts
import { LocalStorageAdapter } from '@aetherAssembly/core'

const storage = new LocalStorageAdapter('myapp') // keys stored as "myapp.foo"

await storage.set('darkMode', true)
await storage.get<boolean>('darkMode') // true
```

#### `MemoryAdapter` — in-memory

Map-backed, no side effects. Use this in tests instead of mocking the other adapters.

```ts
import { MemoryAdapter } from '@aetherAssembly/core'

const storage = new MemoryAdapter()
// same interface — all operations work synchronously under the hood
```

### Shared types

```ts
import type { ID, Timestamp, Nullable, Optional, BaseEntity } from '@aetherAssembly/core'

// Extend BaseEntity for any persisted model
interface WardrobeItem extends BaseEntity {
  // id: string, createdAt: number, updatedAt: number — all inherited
  name: string
  category: string
}
```

---

## `@aetherAssembly/ui`

React 19 components. Styled with `--ae-*` CSS custom properties so each app can map its own palette in.

```ts
import { Button, Card, Badge, Input, Modal } from '@aetherAssembly/ui'
```

### Setup

Import the stylesheet once at your app's entry point:

```ts
import '@aetherAssembly/ui/styles.css'
```

### Theming

The package ships default token values in [`src/styles.css`](./packages/ui/src/styles.css). Override any of these in your app:

| Group | Prefix | Examples |
| - | - | - |
| Colors | `--ae-color-*` | `--ae-color-primary`, `--ae-color-bg`, `--ae-color-text` |
| Spacing | `--ae-space-*` | `--ae-space-1` through `--ae-space-8` |
| Typography | `--ae-font-*` | `--ae-font-sans`, `--ae-font-size-sm`, `--ae-line-height-normal` |
| Radius | `--ae-radius-*` | `--ae-radius-sm`, `--ae-radius-md`, `--ae-radius-full` |
| Shadows | `--ae-shadow-*` | `--ae-shadow-sm`, `--ae-shadow-md`, `--ae-shadow-lg` |

### Components

All components accept a `className` prop for layering additional styles on top of the token defaults.

**`Button`**

```tsx
<Button variant="primary" size="md" loading={false} onClick={save}>
  Save
</Button>
```

`variant`: `primary | secondary | ghost | danger` · `size`: `sm | md | lg` · `loading` disables the button and shows a spinner.

**`Card`**

```tsx
<Card header={<h2>Title</h2>} footer={<Button>Action</Button>}>
  Content here
</Card>
```

**`Badge`**

```tsx
<Badge variant="success">Synced</Badge>
<Badge variant="danger">Error</Badge>
```

`variant`: `default | success | warning | danger | info`

**`Input`**

```tsx
<Input label="Vault name" error={errors.vaultName} hint="e.g. Personal" />
```

Generates a unique React ID automatically. `error` sets `aria-invalid` and renders below the field. `hint` renders as muted helper text.

**`Modal`**

```tsx
<Modal open={isOpen} onClose={() => setOpen(false)} title="Confirm">
  Are you sure?
</Modal>
```

Wraps the native `<dialog>` element with `showModal()` / `close()`.

> The close button is always available. Supply a title or a meaningful `aria-label`. `onClose` requests dismissal; update `open` in the handler.

---

## How the ecosystem fits together

```bash
aether-packages/
  packages/core      →  @aetherAssembly/core  (published to GHPR)
  packages/ui        →  @aetherAssembly/ui    (published to GHPR)

Driftleaf/
  src/renderer       →  uses @aetherAssembly/ui components (Button, Card, Badge, Input, Modal)
                         imports @aetherAssembly/ui/styles.css once at entry point
```

---

## Development

```sh
npm install       # install all workspace deps
npm run build     # tsc --build all packages
npm test          # vitest across workspaces
npm run typecheck # type-check without emitting
npm run clean     # remove dist/ and .tsbuildinfo
```

### Repo layout

```bash
packages/
  core/
    src/
      storage/    # adapter.ts  idb.ts  localstorage.ts  memory.ts
      types/      # ID, Timestamp, Nullable, Optional, BaseEntity
    vitest.config.ts
  ui/
    src/
      components/ # Badge  Button  Card  Input  Modal
      styles.css  # default --ae-* token values
tsconfig.base.json
.npmrc            # routes @aetherAssembly to GHPR
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and how to open a PR.

## Forms and component gallery

Textarea, Select, Checkbox, and Field are also exported, alongside public component prop and variant types. Run `npm run gallery` for interactive examples, theme overrides, and keyboard instructions. See [UI documentation](docs/ui-components.md) and [storage documentation](docs/storage.md) for API details and migration notes.

## Verification

`npm run lint`, `npm run typecheck` (no output), `npm test`, `npm run build`, `npm run test:packages` (packed consumer checks), and `npm run test:browser` (native Chromium behavior). Install the browser once with `npx playwright install chromium`. Clean removes build output and incremental caches.

## License and optional attribution

Licensed under [MIT](LICENSE). Please consider crediting "Powered by AetherAssembly" with a link to https://github.com/AetherAssembly/aether-packages in your About/Credits page or documentation. Public credit is appreciated, not required. MIT's copyright and permission notice requirements still apply.

The license change applies to this source revision and future releases; existing AGPL releases retain their published terms. Before publishing a relicensed release, maintainers must confirm that all included contributions can be offered under MIT.
