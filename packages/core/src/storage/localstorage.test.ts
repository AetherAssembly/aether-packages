import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LocalStorageAdapter } from './localstorage.js'

// Minimal localStorage mock — avoids requiring jsdom
function makeLocalStorage() {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    _store: () => store,
  }
}

beforeEach(() => {
  const mock = makeLocalStorage()
  vi.stubGlobal('localStorage', mock)
})

afterEach(() => vi.unstubAllGlobals())

describe('LocalStorageAdapter', () => {
  // CRUD
  it('returns null for missing keys', async () => {
    const adapter = new LocalStorageAdapter()
    expect(await adapter.get('missing')).toBeNull()
  })

  it('stores and retrieves values', async () => {
    const adapter = new LocalStorageAdapter()
    await adapter.set('key', { value: 42 })
    expect(await adapter.get('key')).toEqual({ value: 42 })
  })

  it('overwrites an existing key', async () => {
    const adapter = new LocalStorageAdapter()
    await adapter.set('key', 'old')
    await adapter.set('key', 'new')
    expect(await adapter.get('key')).toBe('new')
  })

  it('deletes a key', async () => {
    const adapter = new LocalStorageAdapter()
    await adapter.set('key', 'data')
    await adapter.delete('key')
    expect(await adapter.get('key')).toBeNull()
  })

  it('clears all keys', async () => {
    const adapter = new LocalStorageAdapter()
    await adapter.set('a', 1)
    await adapter.set('b', 2)
    await adapter.clear()
    expect(await adapter.keys()).toEqual([])
  })

  it('lists all keys', async () => {
    const adapter = new LocalStorageAdapter()
    await adapter.set('x', 1)
    await adapter.set('y', 2)
    expect((await adapter.keys()).sort()).toEqual(['x', 'y'])
  })

  // Prefix scoping
  describe('with prefix', () => {
    it('scopes keys under the prefix', async () => {
      const adapter = new LocalStorageAdapter('app')
      await adapter.set('theme', 'dark')
      expect(localStorage.getItem('app.theme')).toBe('"dark"')
    })

    it('get returns null for keys outside the prefix', async () => {
      localStorage.setItem('other.theme', '"dark"')
      const adapter = new LocalStorageAdapter('app')
      expect(await adapter.get('theme')).toBeNull()
    })

    it('keys() only returns keys within the prefix', async () => {
      const adapter = new LocalStorageAdapter('app')
      await adapter.set('a', 1)
      localStorage.setItem('other.b', '2')
      expect(await adapter.keys()).toEqual(['a'])
    })

    it('clear() only removes keys within the prefix', async () => {
      const adapter = new LocalStorageAdapter('app')
      await adapter.set('a', 1)
      localStorage.setItem('other.b', '2')
      await adapter.clear()
      expect(await adapter.keys()).toEqual([])
      expect(localStorage.getItem('other.b')).toBe('2')
    })

    it('two adapters with different prefixes do not interfere', async () => {
      const a = new LocalStorageAdapter('alpha')
      const b = new LocalStorageAdapter('beta')
      await a.set('key', 'from-alpha')
      await b.set('key', 'from-beta')
      expect(await a.get('key')).toBe('from-alpha')
      expect(await b.get('key')).toBe('from-beta')
    })
  })

  // SSR guard
  describe('when localStorage is unavailable', () => {
    it('get returns null', async () => {
      vi.stubGlobal('localStorage', undefined)
      const adapter = new LocalStorageAdapter('', { errorMode: 'ignore' })
      expect(await adapter.get('key')).toBeNull()
    })

    it('set is a no-op', async () => {
      vi.stubGlobal('localStorage', undefined)
      const adapter = new LocalStorageAdapter('', { errorMode: 'ignore' })
      await expect(adapter.set('key', 'value')).resolves.toBeUndefined()
    })

    it('keys returns empty array', async () => {
      vi.stubGlobal('localStorage', undefined)
      const adapter = new LocalStorageAdapter('', { errorMode: 'ignore' })
      expect(await adapter.keys()).toEqual([])
    })
  })

  // QuotaExceededError
  describe('onError callback', () => {
    it('calls onError when set throws', async () => {
      const onError = vi.fn()
      const adapter = new LocalStorageAdapter('', { onError })
      const error = new Error('QuotaExceededError')
      vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
        throw error
      })
      await expect(adapter.set('key', 'value')).rejects.toThrow(
        'QuotaExceededError',
      )
      expect(onError).toHaveBeenCalledWith(error)
    })

    it('rejects failed writes by default', async () => {
      const adapter = new LocalStorageAdapter()
      vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
        throw new Error('QuotaExceededError')
      })
      await expect(adapter.set('key', 'value')).rejects.toThrow(
        'QuotaExceededError',
      )
    })
  })
})

for (const method of ['get', 'set', 'delete', 'clear', 'keys'] as const) {
  it(`reports blocked localStorage access in ${method}`, async () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError')
      },
    })
    const onError = vi.fn()
    const adapter = new LocalStorageAdapter('', { onError })
    const operation =
      method === 'set' ? adapter.set('key', 1) : adapter[method]('key')
    await expect(operation).rejects.toThrow('SecurityError')
    expect(onError).toHaveBeenCalledOnce()
  })
}
it('reports malformed JSON and serialization errors', async () => {
  const adapter = new LocalStorageAdapter()
  localStorage.setItem('broken', '{')
  await expect(adapter.get('broken')).rejects.toThrow()
  await expect(adapter.set('undefined', undefined)).rejects.toThrow(TypeError)
  await expect(adapter.set('bigint', 1n)).rejects.toThrow(TypeError)
  const circular: Record<string, unknown> = {}
  circular.self = circular
  await expect(adapter.set('circular', circular)).rejects.toThrow(TypeError)
})
it('explicit ignore mode observes failures and returns fallbacks', async () => {
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
    throw new Error('full')
  })
  const onError = vi.fn()
  await expect(
    new LocalStorageAdapter('', { errorMode: 'ignore', onError }).set('key', 1),
  ).resolves.toBeUndefined()
  expect(onError).toHaveBeenCalledOnce()
})
