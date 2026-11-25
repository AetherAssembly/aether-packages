# @aetherAssembly/core

Give your app one async key-value API for browser storage and temporary state. Choose IndexedDB for structured, persistent browser data, localStorage for JSON values, or an in-memory adapter for tests and non-persistent use. The package does not depend on React.

## Install

In your project's `.npmrc`, route the AetherAssembly scope to GitHub Packages:

```ini
@aetherAssembly:registry=https://npm.pkg.github.com
```

Add authentication to your user-level `~/.npmrc`, outside the project repository:

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` to a GitHub token with `read:packages` permission. Do not put the token in a project file or commit it. Install the package:

```sh
npm install @aetherAssembly/core
```

## Get started

Use `MemoryAdapter` to try the API without setting up a browser database:

```ts
import { MemoryAdapter, type StorageAdapter } from '@aetherAssembly/core'

const storage: StorageAdapter = new MemoryAdapter()
await storage.set('settings', { theme: 'dark' })
const settings = await storage.get<{ theme: string }>('settings')
console.log(settings?.theme) // 'dark'
await storage.delete('settings')
```

## Choose an adapter

| Adapter               | Best for                                                                     | Persistence and values                     |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------------------ |
| `IDBAdapter`          | Browser data that should survive reloads and may use structured-clone values | IndexedDB persists data                    |
| `LocalStorageAdapter` | Small browser values that can be represented as JSON                         | localStorage persists serialized data      |
| `MemoryAdapter`       | Tests, server-side rendering, and temporary state                            | Data lives as long as the adapter instance |

All three implement the same interface:

| Method               | Result                                                            |
| -------------------- | ----------------------------------------------------------------- |
| `get<T>(key)`        | `Promise<T \| null>`; returns `null` when the key is missing      |
| `set<T>(key, value)` | `Promise<void>`; creates or replaces a value                      |
| `delete(key)`        | `Promise<void>`; succeeds if the key is already missing           |
| `clear()`            | `Promise<void>`; removes keys owned by this adapter               |
| `keys()`             | `Promise<string[]>`; returns unprefixed keys in unspecified order |

`get<T>` is a TypeScript assertion, not runtime validation. Stored `null` and a missing key both read as `null`. Use plain JSON values when the same data must work with every adapter: strings, booleans, finite numbers, `null`, arrays, and plain objects. Avoid `undefined`, `BigInt`, functions, cycles, and custom classes.

The adapters handle values differently. `MemoryAdapter` keeps object references, so mutating a stored object changes the stored value. localStorage serializes values as JSON and returns newly parsed objects. IndexedDB uses structured cloning, so it supports more browser-cloneable values than JSON.

## Store data in IndexedDB

Pass the same schema to every adapter that opens a database. List all stores together and increase the version when adding a store:

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

The constructor starts opening the database immediately. Existing stores and records are retained when the schema version increases. Opening a store that does not exist at the current version fails when you use it.

Adapters close their connections when another connection requests an upgrade. Create new adapters using the new version afterward. Call `close()` when you are done; operations on a closed adapter reject. `onTerminated` reports abnormal termination. Other connections to the database must also cooperate with version changes.

IndexedDB is unavailable in Node.js and server-side rendering. Use `MemoryAdapter` when storage does not need to persist there.

## Store data in localStorage

Pass a prefix to keep this adapter's keys separate from other app data:

```ts
import { LocalStorageAdapter } from '@aetherAssembly/core'

const settings = new LocalStorageAdapter('myapp', {
  onError: (error) => console.error('Storage failed', error),
})

try {
  await settings.set('theme', 'dark') // Stored under "myapp.theme"
} catch {
  // Show or record the save failure.
}
```

The prefix scopes `keys()` and `clear()`. Without a prefix, `clear()` removes every localStorage key for the current origin. Choose disjoint prefixes because nested prefixes can overlap.

By default, unavailable storage, blocked access, quota errors, malformed JSON, and serialization failures reject. `onError` observes a failure but does not suppress it. For explicitly best-effort storage, opt into ignore mode:

```ts
const optionalCache = new LocalStorageAdapter('cache', {
  errorMode: 'ignore',
})
```

In ignore mode, failed reads return `null`, failed key listing returns `[]`, and failed writes, deletes, and clears resolve. A throwing `onError` callback still rejects. A partially completed `clear()` cannot be rolled back.

## Use the in-memory adapter

Each `MemoryAdapter` instance owns an independent `Map`. Data disappears when the instance is discarded. This makes it useful for feature tests and temporary state, but it does not test persistence, serialization, or backend failures. Test those behaviors with the adapter your app will use.

## Import shared types

Use `BaseEntity` when a persisted model needs the standard ID and timestamps:

```ts
import type {
  BaseEntity,
  ID,
  Timestamp,
  Nullable,
  Optional,
} from '@aetherAssembly/core'

interface Item extends BaseEntity {
  name: string
}
// BaseEntity: { id: ID; createdAt: Timestamp; updatedAt: Timestamp }
// ID = string; Timestamp = number
// Nullable<T> = T | null; Optional<T> = T | undefined
```

The package also exports `StorageAdapter`, `IDBAdapterOptions`, and `LocalStorageAdapterOptions`.

## Upgrade from 1.x

localStorage failures now reject by default instead of silently returning fallback values. Catch failures in your app or explicitly choose `errorMode: 'ignore'`. If multiple adapters share an IndexedDB database, declare all stores together and coordinate schema versions.

See the [storage guide](../../docs/storage.md) for migration patterns and the [changelog](../../CHANGELOG.md) for release history.

## License

[MIT](./LICENSE). Optional public credit, such as “Powered by AetherAssembly” with a link to the [project](https://github.com/AetherAssembly/aether-packages), is appreciated but is not a license requirement.
