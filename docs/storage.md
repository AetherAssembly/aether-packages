# Storage

`@aetherAssembly/core` provides a unified key-value storage abstraction built around a single `StorageAdapter` interface. All three built-in adapters implement the same async contract, so you can swap them without changing call sites.

---

## The `StorageAdapter` interface

```ts
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}
```

### Contract

| Method | Behaviour |
| - | - |
| `get<T>(key)` | Returns the stored value cast to `T`, or `null` if the key doesn't exist. Never throws for a missing key. |
| `set<T>(key, value)` | Writes `value` under `key`. Values must be JSON-serialisable. Overwrites any existing value silently. |
| `delete(key)` | Removes the key. No-ops if the key doesn't exist. |
| `clear()` | Removes all keys owned by this adapter instance. If the adapter is scoped (e.g. a prefix or a specific object store), only those keys are removed — not the entire underlying store. |
| `keys()` | Returns all key names owned by this adapter. Strips any internal prefix before returning — callers see the same keys they passed to `set`. |

All methods are async. Even `LocalStorageAdapter`, which wraps a synchronous API, returns Promises so callers can treat all adapters uniformly.

---

## `IDBAdapter`

Backed by IndexedDB via the [`idb`](https://github.com/jakearchibald/idb) library. The right choice for any significant data in a browser — IndexedDB is not subject to the 5–10 MB localStorage quota and doesn't block the main thread.

```ts
import { IDBAdapter } from '@aetherAssembly/core'

const storage = new IDBAdapter('my-app', 'items')
```

**Constructor params:**

| Param | Type | Description |
| - | - | - |
| `dbName` | `string` | IndexedDB database name. Use a name unique to your app. |
| `storeName` | `string` | Object store name within that database. Created automatically on first open. |

**How it works:**

The constructor immediately begins opening the database and stores the resulting promise. Every method awaits that promise before operating — so you can construct the adapter and start calling methods right away; the first call will wait for the DB to be ready.

The database is opened at version 1. If you need multiple object stores, create separate `IDBAdapter` instances (one per store) or build a custom `openDB` schema directly with `idb` and use `IDBAdapter` only for the generic stores.

**Use in Attyre:**

```js
const adapter = new IDBAdapter('attyre', 'items')

export async function getItems() {
  const keys = await adapter.keys()
  return Promise.all(keys.map(k => adapter.get(k)))
}

export async function saveItems(items) {
  await adapter.clear()
  await Promise.all(items.map(item => adapter.set(item.id, item)))
}
```

---

## `LocalStorageAdapter`

Wraps `localStorage` with the `StorageAdapter` interface. Values are JSON-serialised on write and parsed on read.

```ts
import { LocalStorageAdapter } from '@aetherAssembly/core'

const storage = new LocalStorageAdapter()           // no prefix
const scoped = new LocalStorageAdapter('myapp')    // keys stored as "myapp.<key>"
```

**Constructor params:**

| Param | Type | Default | Description |
| - | - | - | - |
| `prefix` | `string` | `''` | Optional prefix applied to all keys. Keys are stored as `"<prefix>.<key>"` in localStorage; `get/set/delete/keys` always take and return the unprefixed key. |

**Behaviour details:**

- If `localStorage` is not available (SSR, Web Workers, private browsing with storage blocked), all methods silently no-op. `get` returns `null`, `keys` returns `[]`.
- `clear()` iterates `keys()` and removes only keys matching this instance's prefix. It will not touch keys from other adapters or apps sharing the same `localStorage`.
- `QuotaExceededError` on `set` is swallowed — the write fails silently. If quota errors are a concern, catch them at the call site by wrapping `set` in a try/catch (though `set` itself doesn't throw, you can subclass to add this behaviour).

**When to use it:**

For small, non-critical data where IndexedDB would be overkill — settings, flags, small caches. BIG re-exports it for settings storage:

```ts
// @before-its-gone/core re-export
export { LocalStorageAdapter }
export function createLocalStorageAdapter() {
  return new LocalStorageAdapter()
}
```

---

## `MemoryAdapter`

Map-backed in-memory adapter. Zero side effects — data is lost when the instance is garbage collected.

```ts
import { MemoryAdapter } from '@aetherAssembly/core'

const storage = new MemoryAdapter()
```

**When to use it:**

In unit tests. Don't mock `IDBAdapter` or `LocalStorageAdapter` — use `MemoryAdapter` instead. It implements the full `StorageAdapter` contract identically to the real adapters, so tests written against it are meaningful.

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryAdapter } from '@aetherAssembly/core'

describe('my feature', () => {
  let storage: MemoryAdapter

  beforeEach(() => {
    storage = new MemoryAdapter()
  })

  it('stores and retrieves a value', async () => {
    await storage.set('key', { hello: 'world' })
    expect(await storage.get('key')).toEqual({ hello: 'world' })
  })
})
```

---

## Writing a custom adapter

Implement `StorageAdapter` and follow the contract above. A minimal example:

```ts
import type { StorageAdapter } from '@aetherAssembly/core'

export class SessionStorageAdapter implements StorageAdapter {
  constructor(private readonly prefix = '') {}

  private key(k: string) {
    return this.prefix ? `${this.prefix}.${k}` : k
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = sessionStorage.getItem(this.key(key))
    if (raw === null) return null
    try { return JSON.parse(raw) as T } catch { return null }
  }

  async set<T>(key: string, value: T): Promise<void> {
    sessionStorage.setItem(this.key(key), JSON.stringify(value))
  }

  async delete(key: string): Promise<void> {
    sessionStorage.removeItem(this.key(key))
  }

  async clear(): Promise<void> {
    for (const k of await this.keys()) {
      sessionStorage.removeItem(this.key(k))
    }
  }

  async keys(): Promise<string[]> {
    const prefixDot = this.prefix ? `${this.prefix}.` : ''
    const result: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k === null) continue
      if (prefixDot) {
        if (k.startsWith(prefixDot)) result.push(k.slice(prefixDot.length))
      } else {
        result.push(k)
      }
    }
    return result
  }
}
```

If it's general enough to be useful across apps, add it to `packages/core/src/storage/` and export it from `index.ts`.

---

## Migration pattern

When migrating from one storage backend to another (e.g. localStorage → IDB), do it as a one-time migration on startup:

```js
const MIGRATION_FLAG = 'myapp_idb_migrated_v1'
const idb = new IDBAdapter('myapp', 'items')
const ls = new LocalStorageAdapter('myapp')

async function migrate() {
  if (localStorage.getItem(MIGRATION_FLAG)) return

  const keys = await ls.keys()
  await Promise.all(
    keys.map(async k => {
      const value = await ls.get(k)
      if (value !== null) await idb.set(k, value)
    })
  )

  await ls.clear()
  localStorage.setItem(MIGRATION_FLAG, '1')
}
```

Set the flag in `localStorage` (not the adapter) so it survives the migration itself and is always fast to check on subsequent launches. Use a versioned flag name (`_v1`, `_v2`) so future migrations can target a new version independently.
