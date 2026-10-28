import { openDB, type IDBPDatabase } from 'idb'
import type { StorageAdapter } from './adapter.js'

export type IDBAdapterOptions = {
  version?: number
  /** Declare all stores together; adding stores requires increasing version. */
  stores?: readonly string[]
  onBlocked?: (currentVersion: number, requestedVersion: number | null) => void
  onTerminated?: () => void
}

export class IDBAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBPDatabase>
  private closed = false

  constructor(
    dbName: string,
    private readonly storeName: string,
    options: IDBAdapterOptions = {},
  ) {
    if (typeof indexedDB === 'undefined')
      throw new Error(
        'IDBAdapter requires IndexedDB. Use MemoryAdapter for Node.js / SSR; it does not persist data.',
      )
    const version = options.version ?? 1
    if (!Number.isSafeInteger(version) || version < 1)
      throw new RangeError('IndexedDB version must be a positive safe integer')
    this.dbPromise = openDB(dbName, version, {
      upgrade(db) {
        for (const name of new Set([storeName, ...(options.stores ?? [])])) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name)
        }
      },
      blocked(current, requested) {
        options.onBlocked?.(current, requested)
      },
      blocking: () => {
        void this.close()
      },
      terminated: () => {
        this.closed = true
        options.onTerminated?.()
      },
    })
    // Opening starts eagerly; callers receive failures through operations even if they wait to use the adapter.
    void this.dbPromise.catch(() => {})
  }

  private async database(): Promise<IDBPDatabase> {
    if (this.closed)
      throw new Error('IDBAdapter is closed; create a new adapter to reconnect')
    const db = await this.dbPromise
    if (this.closed) throw new Error('IDBAdapter is closed')
    if (!db.objectStoreNames.contains(this.storeName))
      throw new Error(
        `Store "${this.storeName}" is missing. Increase version and declare all stores in options.stores.`,
      )
    return db
  }

  async close(): Promise<void> {
    this.closed = true
    ;(await this.dbPromise).close()
  }
  async get<T>(key: string): Promise<T | null> {
    return (
      ((await (await this.database()).get(this.storeName, key)) as
        T | undefined) ?? null
    )
  }
  async set<T>(key: string, value: T): Promise<void> {
    await (await this.database()).put(this.storeName, value, key)
  }
  async delete(key: string): Promise<void> {
    await (await this.database()).delete(this.storeName, key)
  }
  async clear(): Promise<void> {
    await (await this.database()).clear(this.storeName)
  }
  async keys(): Promise<string[]> {
    return (await (
      await this.database()
    ).getAllKeys(this.storeName)) as string[]
  }
}
