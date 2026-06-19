import { openDB, type IDBPDatabase } from 'idb'
import type { StorageAdapter } from './adapter.js'

export class IDBAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBPDatabase>

  constructor(
    private readonly dbName: string,
    private readonly storeName: string,
  ) {
    this.dbPromise = openDB(dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName)
        }
      },
    })
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.dbPromise
    const value = await db.get(this.storeName, key)
    return (value as T | undefined) ?? null
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.dbPromise
    await db.put(this.storeName, value, key)
  }

  async delete(key: string): Promise<void> {
    const db = await this.dbPromise
    await db.delete(this.storeName, key)
  }

  async clear(): Promise<void> {
    const db = await this.dbPromise
    await db.clear(this.storeName)
  }

  async keys(): Promise<string[]> {
    const db = await this.dbPromise
    return (await db.getAllKeys(this.storeName)) as string[]
  }
}
