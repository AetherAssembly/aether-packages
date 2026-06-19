import type { StorageAdapter } from './adapter.js'

export class MemoryAdapter implements StorageAdapter {
  private store = new Map<string, unknown>()

  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T | undefined) ?? null
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value)
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async clear(): Promise<void> {
    this.store.clear()
  }

  async keys(): Promise<string[]> {
    return [...this.store.keys()]
  }
}
