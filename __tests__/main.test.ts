import { vi, describe, it, expect, beforeEach } from 'vitest'
import { run } from '../src/main'
import { getInput } from '@actions/core'
import { getOctokit } from '@actions/github'
import { createWorkflowEvent } from '../src/tb'

vi.mock('../src/tb', () => ({
  createWorkflowEvent: vi.fn(),
  pushToTinybird: vi.fn()
}))

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  getInput: vi.fn(),
  setFailed: vi.fn(),
  setSecret: vi.fn()
}))

vi.mock('@actions/github', () => ({
  context: {
    payload: {
      pull_request: {
        number: 1
      }
    },
    runId: 'test_run_id',
    repo: {
      owner: 'localstack',
      repo: 'tinybird-workflow-push'
    }
  },
  getOctokit: vi.fn()
}))

const mockOctokit = {
  rest: {
    actions: {
      async getWorkflowRunAttempt() {
        return { data: { run_started_at: '2020-01-22T19:33:08Z' } }
      },
      listJobsForWorkflowRunAttempt: vi.fn()
    }
  }
}
vi.mocked(getOctokit).mockReturnValue(mockOctokit)

describe('run', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getOctokit).mockReturnValue(mockOctokit)
  })

  it('should send custom outcome', async () => {
    vi.mocked(getInput).mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'outcome':
          return 'custom_outcome'
        default:
          return 'mocked-input'
      }
    })

    await run()

    expect(createWorkflowEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'custom_outcome'
    )
  })

  it('should send successful on all successful jobs', async () => {
    vi.mocked(
      mockOctokit.rest.actions.listJobsForWorkflowRunAttempt
    ).mockReturnValue({
      data: {
        jobs: [
          { name: 'Successful Job 1', conclusion: 'success' },
          { name: 'Successful Job 2', conclusion: 'success' }
        ]
      }
    })

    vi.mocked(getInput).mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'outcome':
          return ''
        default:
          return 'mocked-input'
      }
    })

    await run()

    expect(createWorkflowEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'success'
    )
  })

  it('should send failed on a failed job', async () => {
    vi.mocked(
      mockOctokit.rest.actions.listJobsForWorkflowRunAttempt
    ).mockResolvedValue({
      data: {
        jobs: [
          { name: 'Failed Job', conclusion: 'failure' },
          { name: 'Successful Job', conclusion: 'success' }
        ]
      }
    })

    vi.mocked(getInput).mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'outcome':
          return ''
        default:
          return 'mocked-input'
      }
    })

    await run()

    expect(createWorkflowEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'failure'
    )
  })

  it('should send failed on a cancelled job', async () => {
    vi.mocked(
      mockOctokit.rest.actions.listJobsForWorkflowRunAttempt
    ).mockResolvedValue({
      data: {
        jobs: [
          { name: 'Cancelled Job', conclusion: 'cancelled' },
          { name: 'Successful Job', conclusion: 'success' }
        ]
      }
    })

    vi.mocked(getInput).mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'outcome':
          return ''
        default:
          return 'mocked-input'
      }
    })

    await run()

    expect(createWorkflowEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'failure'
    )
  })
})
