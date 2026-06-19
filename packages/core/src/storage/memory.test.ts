import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryAdapter } from './memory.js'

describe('MemoryAdapter', () => {
  let adapter: MemoryAdapter

  beforeEach(() => {
    adapter = new MemoryAdapter()
  })

  it('returns null for missing keys', async () => {
    expect(await adapter.get('missing')).toBeNull()
  })

  it('stores and retrieves values', async () => {
    await adapter.set('key', { value: 42 })
    expect(await adapter.get('key')).toEqual({ value: 42 })
  })

  it('deletes a key', async () => {
    await adapter.set('key', 'data')
    await adapter.delete('key')
    expect(await adapter.get('key')).toBeNull()
  })

  it('clears all keys', async () => {
    await adapter.set('a', 1)
    await adapter.set('b', 2)
    await adapter.clear()
    expect(await adapter.keys()).toEqual([])
  })

  it('lists all keys', async () => {
    await adapter.set('x', 1)
    await adapter.set('y', 2)
    const keys = await adapter.keys()
    expect(keys.sort()).toEqual(['x', 'y'])
  })

  it('overwrites an existing key', async () => {
    await adapter.set('key', 'old')
    await adapter.set('key', 'new')
    expect(await adapter.get('key')).toBe('new')
  })
})
