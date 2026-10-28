# @aetherAssembly/core

Async key-value storage adapters and shared TypeScript types for AetherAssembly
applications. Use the same storage interface with IndexedDB, localStorage, or an
in-memory Map. No React dependency is required.

## Installation

Configure the GitHub Packages scope in your project's `.npmrc`:

```ini
@aetherAssembly:registry=https://npm.pkg.github.com
```

Configure authentication only in your user-level `~/.npmrc` (in your home
directory, outside the project repository):

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` in your environment to a GitHub token with
`read:packages` permission. Keep tokens and authentication settings out of the
project's `.npmrc` and version control. Then install:

```sh
npm install @aetherAssembly/core
```

## Quick start

```ts
import { MemoryAdapter, type StorageAdapter } from '@aetherAssembly/core'

const storage: StorageAdapter = new MemoryAdapter()
await storage.set('settings', { theme: 'dark' })
const settings = await storage.get<{ theme: string }>('settings')
console.log(settings?.theme) // 'dark'
await storage.delete('settings')
```

## Storage interface

Every adapter implements these methods:

| Method | Result |
| --- | --- |
| `get<T>(key: string)` | `Promise<T \| null>`; missing keys return `null` |
| `set<T>(key: string, value: T)` | `Promise<void>`; creates or overwrites a value |
| `delete(key: string)` | `Promise<void>`; missing keys are harmless |
| `clear()` | `Promise<void>`; removes keys within the adapter's scope |
| `keys()` | `Promise<string[]>`; returns unprefixed keys in unspecified order |

`get<T>` does not validate data at runtime. Stored `null` and missing values both
read as `null`. Operations reject on backend failures unless explicitly configured
otherwise for localStorage.

## Choosing an adapter

| Adapter | Environment | Persistence and value behavior |
| --- | --- | --- |
| `IDBAdapter` | Browsers with IndexedDB | Persistent, structured-clone values |
| `LocalStorageAdapter` | Environments with localStorage | Persistent, JSON serialization |
| `MemoryAdapter` | Browsers, Node.js, SSR, tests | Instance lifetime; retains object references |

For portable values, use plain JSON data: strings, booleans, finite numbers, null,
arrays, and plain objects. Avoid undefined, BigInt, functions, cycles, and custom
classes when swapping backends. Mutating an object stored in MemoryAdapter changes
the stored value; the persistent adapters return deserialized or cloned values.

### IndexedDB

```ts
import { IDBAdapter, type IDBAdapterOptions } from '@aetherAssembly/core'

const schema: IDBAdapterOptions = {
  version: 1,
  stores: ['items', 'settings'],
  onBlocked: (current, requested) => {
    console.warn(`Database upgrade blocked: ${current} → ${requested}`)
  },
}
const items = new IDBAdapter('my-app', 'items', schema)
const settings = new IDBAdapter('my-app', 'settings', schema)

await items.set('first', { name: 'Example' })
await items.close()
await settings.close()
```

The constructor begins opening the database immediately. Declare all stores in a
shared schema; increase `version` when adding stores. Existing stores and records
are retained. Opening a missing store without an upgrade fails on operations with
an explanatory error.

Connections close automatically when another connection requests an upgrade.
Create new adapters using the new version afterward. `close()` releases a
connection; subsequent operations reject. `onTerminated` reports abnormal
termination. External connections must also cooperate with version changes.
IndexedDB is unavailable in Node.js/SSR; use MemoryAdapter for non-persistent data.

### localStorage

```ts
import { LocalStorageAdapter } from '@aetherAssembly/core'

const settings = new LocalStorageAdapter('myapp', {
  onError: error => console.error('Storage failed', error),
})

try {
  await settings.set('theme', 'dark') // Stored under "myapp.theme"
} catch {
  // Report the save failure to the user.
}
```

A prefix scopes `keys()` and `clear()`. Without one, `clear()` removes all
localStorage keys for the origin. Choose disjoint prefixes; nested prefixes can
overlap.

By default, unavailable storage, blocked access, quota errors, malformed JSON,
and serialization failures reject. `onError` observes failures without suppressing
them. For explicitly best-effort storage:

```ts
const optionalCache = new LocalStorageAdapter('cache', { errorMode: 'ignore' })
```

In ignore mode, failed reads return `null`, failed key listing returns `[]`, and
failed writes, deletes, and clears resolve. A throwing `onError` callback still
rejects. Neither mode rolls back a partially completed clear.

### Memory

```ts
const storage = new MemoryAdapter()
```

Each instance has an independent Map. Data disappears with the instance. Useful
for feature tests and temporary state, but test persistent adapters directly when
serialization and backend failures matter.

## Shared types

```ts
import type {
  BaseEntity, ID, Timestamp, Nullable, Optional,
} from '@aetherAssembly/core'

interface Item extends BaseEntity {
  name: string
}
// BaseEntity: { id: ID; createdAt: Timestamp; updatedAt: Timestamp }
// ID = string; Timestamp = number
// Nullable<T> = T | null; Optional<T> = T | undefined
```

Public storage types include `StorageAdapter`, `IDBAdapterOptions`, and
`LocalStorageAdapterOptions`.

## Migration notes

The upcoming release changes localStorage failures from silent fallbacks to
rejected promises. Handle failures or explicitly select `errorMode: 'ignore'`.
Applications sharing an IndexedDB database should declare all stores together and
coordinate schema versions. See the [storage guide](https://github.com/AetherAssembly/aether-packages/blob/main/docs/storage.md)
and [changelog](https://github.com/AetherAssembly/aether-packages/blob/main/CHANGELOG.md).

## License

[MIT](./LICENSE). Optional public credit, such as “Powered by AetherAssembly” with
a link to the [project](https://github.com/AetherAssembly/aether-packages), is
appreciated and adds no license condition.
