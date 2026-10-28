import 'fake-indexeddb/auto'
import { describe, it, expect, afterEach } from 'vitest'
import { MemoryAdapter } from './memory.js'
import { LocalStorageAdapter } from './localstorage.js'
import { IDBAdapter } from './idb.js'
import type { StorageAdapter } from './adapter.js'
import { vi } from 'vitest'

import { mockStorage } from './test-helpers.js'
afterEach(() => vi.unstubAllGlobals())
for (const backend of ['memory', 'localStorage', 'indexedDB']) {
  describe(`${backend} contract`, () => {
    it('preserves JSON values, overwrites, lists, deletes, and clears', async () => {
      let adapter: StorageAdapter
      if (backend === 'memory') adapter = new MemoryAdapter()
      else if (backend === 'localStorage') {
        vi.stubGlobal('localStorage', mockStorage())
        adapter = new LocalStorageAdapter('contract')
      } else
        adapter = new IDBAdapter(`contract-${crypto.randomUUID()}`, 'items')
      try {
        expect(await adapter.get('missing')).toBeNull()
        for (const [i, value] of [
          false,
          0,
          '',
          null,
          [1, 'a'],
          { nested: { ok: true } },
        ].entries()) {
          await adapter.set(String(i), value)
          expect(await adapter.get(String(i))).toEqual(value)
        }
        await adapter.set('0', 'overwritten')
        expect(await adapter.get('0')).toBe('overwritten')
        await adapter.delete('missing')
        await adapter.delete('0')
        expect((await adapter.keys()).sort()).toEqual(['1', '2', '3', '4', '5'])
        await adapter.clear()
        expect(await adapter.keys()).toEqual([])
      } finally {
        if (adapter instanceof IDBAdapter) await adapter.close()
      }
    })
  })
}
