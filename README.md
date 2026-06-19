# aether-packages

Shared packages for the AetherAssembly ecosystem, published to the GitHub Package Registry under `@aetherAssembly`.

| Package | Description |
|---|---|
| [`@aetherAssembly/core`](./packages/core) | Storage adapters and shared TypeScript types |
| [`@aetherAssembly/ui`](./packages/ui) | React 19 component library |

Consumed by [Before It's Gone](https://github.com/AetherAssembly/Before-Its-Gone) and [Attyre](https://github.com/AetherAssembly/Attyre).

---

## Installation

Add to your project's `.npmrc` to route the scope to GitHub Packages:

```
@aetherAssembly:registry=https://npm.pkg.github.com
```

Then install:

```sh
npm install @aetherAssembly/core
npm install @aetherAssembly/ui   # React apps only
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

**Attyre** uses this to store its entire wardrobe in IndexedDB:

```js
// Attyre — js/store.js
import { IDBAdapter } from '@aetherAssembly/core'

const adapter = new IDBAdapter('attyre', 'items')

export async function getItems() {
  const keys = await adapter.keys()
  return Promise.all(keys.map(k => adapter.get(k)))
}
```

**Before It's Gone** uses it through a typed schema built directly with `idb`, but re-exports `LocalStorageAdapter` from this package for settings storage:

```ts
// Before It's Gone — packages/core/src/storage.ts
import { LocalStorageAdapter, type StorageAdapter } from '@aetherAssembly/core'

export type { StorageAdapter as KeyValueStorage }
export { LocalStorageAdapter }
export function createLocalStorageAdapter() {
  return new LocalStorageAdapter()
}
```

#### `LocalStorageAdapter` — localStorage

Async wrapper around `localStorage`. Gracefully no-ops when `localStorage` is unavailable (SSR, Web Workers). An optional prefix scopes all keys — `clear()` and `keys()` only touch keys within that prefix.

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

### Theming

The package ships default token values in [`src/styles.css`](./packages/ui/src/styles.css). Override them in your app:

```css
:root {
  --ae-color-primary:       #C9A96E;
  --ae-color-primary-hover: #A07C45;
  --ae-color-bg:            #FFFFFF;
  --ae-color-text:          #2A2118;
  --ae-color-border:        #D4C8B5;
  /* ... */
}
```

Attyre maps its warm-palette variables directly:

```css
/* Attyre — style.css */
:root {
  --ae-color-primary:       var(--gold);
  --ae-color-primary-hover: var(--gold-dark);
  --ae-color-text:          var(--ink);
  --ae-color-border:        var(--stone-dark);
}
```

Before It's Gone imports components via its local `@before-its-gone/ui` package (which wraps `@aetherAssembly/ui`):

```tsx
// Before It's Gone — packages/ui/src/InventoryCard.tsx
import { Badge } from '@aetherAssembly/ui'

export function InventoryCard({ item }) {
  return (
    <div>
      <Badge variant="warning">{item.daysLeft}d left</Badge>
    </div>
  )
}
```

### Components

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
<Badge variant="success">Fresh</Badge>
<Badge variant="danger">Expired</Badge>
```

`variant`: `default | success | warning | danger | info`

**`Input`**

```tsx
<Input label="City" error={errors.city} hint="e.g. Tokyo Japan" />
```

Generates an `id` from the label automatically. `error` sets `aria-invalid` and renders below the field. `hint` renders as muted helper text.

**`Modal`**

```tsx
<Modal open={isOpen} onClose={() => setOpen(false)} title="Confirm">
  Are you sure?
</Modal>
```

Wraps the native `<dialog>` element with `showModal()` / `close()`.

---

## How the ecosystem fits together

```
aether-packages/
  packages/core      →  @aetherAssembly/core  (published to GHPR)
  packages/ui        →  @aetherAssembly/ui    (published to GHPR)

Before-Its-Gone/
  packages/core      →  @before-its-gone/core  (local workspace)
    └─ re-exports LocalStorageAdapter from @aetherAssembly/core
    └─ uses idb directly for its typed inventory/history/wastelog schema
  packages/ui        →  @before-its-gone/ui    (local workspace)
    └─ uses @aetherAssembly/ui components (Badge, etc.)
  apps/web           →  consumes @before-its-gone/core + ui

Attyre/
  js/store.js        →  imports IDBAdapter from @aetherAssembly/core directly
```

BIG's local packages are named `@before-its-gone/*` (not `@aetherAssembly/*`) to avoid collision with the published shared packages, which are also installed at the root.

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

```
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

### Publishing

Packages publish automatically when a `v*` tag is pushed. The workflow runs build → test → `npm publish --workspaces`:

```sh
git tag v1.0.1
git push origin v1.0.1
```
