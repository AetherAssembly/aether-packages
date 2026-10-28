import type { StorageAdapter } from './adapter.js'

export type LocalStorageAdapterOptions = {
  onError?: (error: unknown) => void
  /** Explicitly opt into best-effort storage, including unavailable environments. */
  errorMode?: 'throw' | 'ignore'
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(
    private readonly prefix = '',
    private readonly options: LocalStorageAdapterOptions = {},
  ) {}

  private key(key: string): string {
    return this.prefix ? `${this.prefix}.${key}` : key
  }

  private run<T>(operation: (storage: Storage) => T, fallback: T): T {
    try {
      if (typeof localStorage === 'undefined')
        throw new Error(
          'localStorage is unavailable. Use MemoryAdapter for non-persistent storage.',
        )
      return operation(localStorage)
    } catch (error) {
      this.options.onError?.(error)
      if (this.options.errorMode !== 'ignore') throw error
      return fallback
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return this.run((storage) => {
      const raw = storage.getItem(this.key(key))
      return raw === null ? null : (JSON.parse(raw) as T)
    }, null)
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.run((storage) => {
      const serialized = JSON.stringify(value)
      if (serialized === undefined)
        throw new TypeError('Value is not JSON serializable')
      storage.setItem(this.key(key), serialized)
    }, undefined)
  }

  async delete(key: string): Promise<void> {
    this.run((storage) => storage.removeItem(this.key(key)), undefined)
  }

  async clear(): Promise<void> {
    this.run((storage) => {
      for (const key of this.listKeys(storage))
        storage.removeItem(this.key(key))
    }, undefined)
  }

  private listKeys(storage: Storage): string[] {
    const prefix = this.prefix ? `${this.prefix}.` : ''
    const keys: string[] = []
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key !== null && key.startsWith(prefix))
        keys.push(key.slice(prefix.length))
    }
    return keys
  }

  async keys(): Promise<string[]> {
    return this.run((storage) => this.listKeys(storage), [])
  }
}
