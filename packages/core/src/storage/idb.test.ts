import 'fake-indexeddb/auto'
import { it, expect, vi } from 'vitest'
import { openDB } from 'idb'
import { IDBAdapter } from './idb.js'

it('declares multiple stores, isolates data, and upgrades without losing records', async () => {
  const name = crypto.randomUUID()
  const a = new IDBAdapter(name, 'a', { stores: ['a', 'b'] })
  const b = new IDBAdapter(name, 'b')
  await a.set('key', 'a')
  await b.set('key', 'b')
  await a.clear()
  expect(await b.get('key')).toBe('b')
  const c = new IDBAdapter(name, 'c', { version: 2, stores: ['a', 'b', 'c'] })
  await c.set('key', 'c') // older adapters automatically release upgrade-blocking connections
  await expect(a.keys()).rejects.toThrow('closed')
  const reopened = new IDBAdapter(name, 'b', { version: 2 })
  expect(await reopened.get('key')).toBe('b')
  await Promise.all([a.close(), b.close(), c.close(), reopened.close()])
})
it('explains missing stores and rejects use after close', async () => {
  const name = crypto.randomUUID()
  const a = new IDBAdapter(name, 'a')
  await a.set('key', 1)
  const b = new IDBAdapter(name, 'b')
  await expect(b.keys()).rejects.toThrow('Increase version')
  await a.close()
  await expect(a.get('key')).rejects.toThrow('closed')
  await b.close()
})
it('notifies when an external connection blocks an upgrade', async () => {
  const name = crypto.randomUUID()
  const external = await openDB(name, 1)
  const blocked = vi.fn(() => external.close())
  const adapter = new IDBAdapter(name, 'items', {
    version: 2,
    onBlocked: blocked,
  })
  await adapter.set('key', 1)
  expect(blocked).toHaveBeenCalledWith(1, 2)
  await adapter.close()
})
it('rejects unsupported values and invalid versions', async () => {
  expect(() => new IDBAdapter('invalid', 'items', { version: 0 })).toThrow(
    RangeError,
  )
  const adapter = new IDBAdapter(crypto.randomUUID(), 'items')
  await expect(adapter.set('fn', () => {})).rejects.toThrow()
  await adapter.close()
})
