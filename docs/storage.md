# Storage

All adapters implement the async `StorageAdapter` interface: `get<T>(key)`, `set<T>(key, value)`, `delete(key)`, `clear()`, and `keys()`. Missing values return `null`. Deleting missing keys succeeds. Keys are unprefixed strings, ordering is unspecified, and clearing is scoped to the selected store/prefix (an empty localStorage prefix owns the entire storage area). `get<T>` is a type assertion, not runtime validation.

## Portable values and mutation

For interchangeable behavior, use plain JSON values: null, booleans, finite numbers, strings, arrays, and plain objects containing those values. Avoid undefined, functions, symbols, BigInt, cycles, custom classes, and non-finite numbers. Stored null and missing keys both read as null.

| Adapter | Value behavior | Persistence |
| --- | --- | --- |
| MemoryAdapter | Stores object references; mutating a stored or retrieved object changes the stored value | Instance lifetime |
| LocalStorageAdapter | JSON serialization; retrieved objects are new copies. Dates become strings and unsupported nested values may be omitted or converted by JSON | Browser localStorage |
| IDBAdapter | Structured clone; supports additional browser-cloneable values, independently of JSON | Browser IndexedDB |

MemoryAdapter is useful for feature tests, but cannot substitute for backend tests involving serialization, errors, or persistence.

## IndexedDB schema and lifecycle

```ts
import { IDBAdapter, type IDBAdapterOptions } from '@aetherAssembly/core'

const schema: IDBAdapterOptions = { version: 1, stores: ['items', 'settings'] }
const items = new IDBAdapter('my-app', 'items', schema)
const settings = new IDBAdapter('my-app', 'settings', schema)
await items.set('example', { name: 'Example' })
await items.close()
await settings.close()
```

Declare all stores together. When adding stores, increase `version` and pass the same schema to every adapter using the database. Existing records and stores are retained. Opening a missing store without increasing the version produces an actionable error on operations. Older adapters automatically close when another connection requests an upgrade; create new adapters at the new version afterward. `close()` releases a connection and rejects subsequent operations. `onBlocked(currentVersion, requestedVersion)` reports other connections preventing an upgrade; `onTerminated()` reports abnormal termination. External connections must also close on version changes. Open and operation failures reject promises. IndexedDB is unavailable in Node.js/SSR; MemoryAdapter provides non-persistent storage there.

## localStorage errors and migration from 1.x

```ts
import { LocalStorageAdapter } from '@aetherAssembly/core'
const storage = new LocalStorageAdapter('myapp', {
  onError: error => console.error('Storage failed', error),
})
try { await storage.set('theme', 'dark') } catch { /* Show save failure */ }
```

**Breaking change:** failures now reject by default, including unavailable storage, blocked access, quota exhaustion, invalid JSON, and serialization errors. `onError` observes failures and does not suppress them. To explicitly preserve best-effort behavior, use `{ errorMode: 'ignore' }`; failures still notify `onError`, while reads return null, keys return [], and writes/deletes/clear resolve. A throwing `onError` callback still rejects. A partially completed clear cannot be rolled back.

Prefixes use `prefix.key`; choose disjoint prefixes (avoid nested prefixes such as `app` and `app.settings`). Without a prefix, clear removes all localStorage keys for the origin. No adapter provides cross-call transactions through the shared interface. For migration, copy and verify all records before clearing the source, and use a versioned completion marker. Prefer an IndexedDB transaction for migrations requiring atomicity.

## Custom adapters

Export a class implementing `StorageAdapter`. Keep operations async, reject failures, return null for missing keys, and respect ownership boundaries in keys/clear. Run the same contract cases as the built-in adapters, plus backend-specific persistence and failure tests.
