import { run } from '../src/main'
import { getInput } from '@actions/core'
import { getOctokit } from '@actions/github'
import { createWorkflowEvent } from '../src/tb'

jest.mock('../src/tb', () => ({
  createWorkflowEvent: jest.fn(),
  pushToTinybird: jest.fn()
}))

jest.mock('@actions/core', () => ({
  info: jest.fn(),
  getInput: jest.fn(),
  setFailed: jest.fn(),
  setSecret: jest.fn()
}))

jest.mock('@actions/github', () => ({
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
  getOctokit: jest.fn()
}))

// mock the getWorkflowRunAttempt
const mockOctokit = {
  rest: {
    actions: {
      async getWorkflowRunAttempt() {
        return { data: { run_started_at: '2020-01-22T19:33:08Z' } }
      },
      listJobsForWorkflowRunAttempt: jest.fn()
    }
  }
}
;(getOctokit as jest.Mock).mockReturnValue(mockOctokit)

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send custom outcome', async () => {
    // mock getInput
    // eslint-disable-next-line no-extra-semi
    ;(getInput as jest.Mock).mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'outcome':
          return 'custom_outcome'
        default:
          return 'mocked-input'
      }
    })

    // run the function
    await run()

    // assertions
    expect(createWorkflowEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'custom_outcome'
    )
  })

  it('should send send successful on all successful jobs', async () => {
    mockOctokit.rest.actions.listJobsForWorkflowRunAttempt.mockReturnValue({
      data: {
        jobs: [
          {
            name: 'Successful Job 1',
            conclusion: 'success'
          },
          {
            name: 'Successful Job 2',
            conclusion: 'success'
          }
        ]
      }
    })

    // mock getInput
    ;(getInput as jest.Mock).mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'outcome':
          return undefined
        default:
          return 'mocked-input'
      }
    })

    // run the function
    await run()

    // assertions
    expect(createWorkflowEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'success'
    )
  })

  it('should send send failed on a failed job', async () => {
    mockOctokit.rest.actions.listJobsForWorkflowRunAttempt.mockImplementation(
      async () => {
        return {
          data: {
            jobs: [
              {
                name: 'Failed Job',
                conclusion: 'failure'
              },
              {
                name: 'Successful Job',
                conclusion: 'success'
              }
            ]
          }
        }
      }
    )

    // mock getInput
    ;(getInput as jest.Mock).mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'outcome':
          return undefined
        default:
          return 'mocked-input'
      }
    })

    // run the function
    await run()

    // assertions
    expect(createWorkflowEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'failure'
    )
  })

  it('should send send failed on a cancelled job', async () => {
    mockOctokit.rest.actions.listJobsForWorkflowRunAttempt.mockImplementation(
      async () => {
        return {
          data: {
            jobs: [
              {
                name: 'Cancelled Job',
                conclusion: 'cancelled'
              },
              {
                name: 'Successful Job',
                conclusion: 'success'
              }
            ]
          }
        }
      }
    )

    // mock getInput
    ;(getInput as jest.Mock).mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'outcome':
          return undefined
        default:
          return 'mocked-input'
      }
    })

    // run the function
    await run()

    // assertions
    expect(createWorkflowEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'failure'
    )
  })
})
