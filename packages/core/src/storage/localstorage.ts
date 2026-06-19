import type { StorageAdapter } from './adapter.js'

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly prefix = '') {}

  private key(k: string): string {
    return this.prefix ? `${this.prefix}.${k}` : k
  }

  async get<T>(key: string): Promise<T | null> {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(this.key(key))
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(this.key(key), JSON.stringify(value))
    } catch {
      // QuotaExceededError — best-effort
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(this.key(key))
  }

  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') return
    for (const k of await this.keys()) {
      localStorage.removeItem(this.key(k))
    }
  }

  async keys(): Promise<string[]> {
    if (typeof localStorage === 'undefined') return []
    const prefixDot = this.prefix ? `${this.prefix}.` : ''
    const result: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k !== null) {
        if (prefixDot) {
          if (k.startsWith(prefixDot)) result.push(k.slice(prefixDot.length))
        } else {
          result.push(k)
        }
      }
    }
    return result
  }
}
