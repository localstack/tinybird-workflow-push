import * as main from '../src/main'
import { vi, describe, it, expect } from 'vitest'

const runMock = vi.spyOn(main, 'run').mockResolvedValue()

describe('index', () => {
  it('calls run when imported', async () => {
    await import('../src/index')

    expect(runMock).toHaveBeenCalled()
  })
})
