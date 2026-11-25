# Choose and use a storage adapter

Use the adapter that matches your app's environment and data lifetime:

| Adapter               | Choose it when                                                     | Persistence and value behavior                                |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `IDBAdapter`          | A browser app needs persistent storage or structured-clone values  | IndexedDB persists data and supports browser-cloneable values |
| `LocalStorageAdapter` | A browser app stores JSON-compatible values in localStorage        | Values are serialized as JSON                                 |
| `MemoryAdapter`       | You need temporary state, server-side rendering, or a test adapter | Values live in an in-memory Map for the adapter's lifetime    |

All adapters share the same async `StorageAdapter` interface. You can change the backend without changing the calls your app makes.

## What to expect from every adapter

The interface provides `get<T>(key)`, `set<T>(key, value)`, `delete(key)`, `clear()`, and `keys()`.

- A missing key returns `null`. Deleting a missing key succeeds.
- Keys are returned without a prefix. Their order is unspecified.
- `clear()` removes only data owned by the selected store or prefix. An empty localStorage prefix owns the entire origin's localStorage.
- `get<T>` is a TypeScript assertion. It does not validate the stored value at runtime.
- A stored `null` and a missing key both return `null`.

For values that must work with all three adapters, use plain JSON data: `null`, booleans, finite numbers, strings, arrays, and plain objects containing those values. Avoid `undefined`, functions, symbols, `BigInt`, cycles, custom classes, and non-finite numbers.

The adapters do not copy values in the same way:

| Adapter               | What happens when you read or change an object                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `MemoryAdapter`       | Stores object references. Mutating a stored or retrieved object also changes the stored value.                                     |
| `LocalStorageAdapter` | Serializes to JSON and returns newly parsed objects. Dates become strings, and JSON may omit or convert unsupported nested values. |
| `IDBAdapter`          | Uses structured clone and supports additional browser-cloneable values that JSON does not.                                         |

Use `MemoryAdapter` for feature tests, but test persistent adapters directly when serialization, errors, or persistence matter.

## Set up IndexedDB

Use one shared schema for every store in a database. Increase its version when you add a store:

```ts
import { IDBAdapter, type IDBAdapterOptions } from '@aetherAssembly/core'

const schema: IDBAdapterOptions = {
  version: 1,
  stores: ['items', 'settings'],
}
const items = new IDBAdapter('my-app', 'items', schema)
const settings = new IDBAdapter('my-app', 'settings', schema)

await items.set('example', { name: 'Example' })
await items.close()
await settings.close()
```

Declare all stores together and pass the same schema to every adapter using that database. Increasing the version retains existing stores and records. If an adapter opens a store that has not been created at the current version, its operations reject with an actionable error.

The constructor starts opening the database immediately. If another connection requests an upgrade, older adapters close automatically; create new adapters with the new version afterward. Call `close()` when finished. Operations on a closed adapter reject.

Use `onBlocked(currentVersion, requestedVersion)` to learn when other connections are preventing an upgrade. Use `onTerminated()` to respond to abnormal connection termination. Other connections to the database must also close when a version changes.

Open and operation failures reject promises. IndexedDB is unavailable in Node.js and server-side rendering; use `MemoryAdapter` there when data does not need to persist.

## Handle localStorage errors

By default, localStorage failures reject, including unavailable or blocked storage, quota exhaustion, invalid JSON, and serialization errors. Catch failures where your app can tell the user that a save did not succeed:

```ts
import { LocalStorageAdapter } from '@aetherAssembly/core'

const storage = new LocalStorageAdapter('myapp', {
  onError: (error) => console.error('Storage failed', error),
})

try {
  await storage.set('theme', 'dark')
} catch {
  // Show a save failure or offer another action.
}
```

`onError` observes a failure; it does not suppress it. To explicitly accept best-effort behavior, set `errorMode: 'ignore'`:

```ts
const optionalCache = new LocalStorageAdapter('cache', {
  errorMode: 'ignore',
  onError: (error) => console.error('Cache unavailable', error),
})
```

In ignore mode, failed reads return `null`, failed `keys()` calls return `[]`, and failed writes, deletes, and clears resolve. A throwing `onError` callback still rejects. A partially completed clear cannot be rolled back.

## Keep localStorage keys separate

Prefixes use the form `prefix.key`. A prefix limits `keys()` and `clear()` to keys owned by that adapter. Choose disjoint prefixes and avoid overlapping pairs such as `app` and `app.settings`.

Without a prefix, `clear()` removes every localStorage key for the origin. Do not use an unprefixed adapter if the origin contains data owned by other parts of your app.

## Migrate stored data safely

The shared interface does not provide transactions across calls. When migrating records, copy and verify them before clearing the source. Store a versioned completion marker so the migration can be retried safely. If a migration must be atomic, prefer an IndexedDB transaction.

## Add a custom adapter

Export a class that implements `StorageAdapter`. Keep its operations async, reject backend failures, return `null` for missing keys, and make `keys()` and `clear()` respect the adapter's ownership boundary.

Run the same contract tests used by the built-in adapters, then add tests for the backend's persistence, serialization, and failure behavior.
