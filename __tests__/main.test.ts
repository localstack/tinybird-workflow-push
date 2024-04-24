import { run } from '../src/main'
import { getInput } from '@actions/core'
import { getOctokit } from '@actions/github'
import { createWorkflowEvent } from '../src/tb'

jest.mock('../src/tb', () => ({
  createWorkflowEvent: jest.fn()
}))

jest.mock('@actions/core', () => ({
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

describe('run', () => {
  it('should send custom outcome', async () => {
    // mock the getWorkflowRunAttempt
    const mockOctokit = {
      rest: {
        actions: {
          async getWorkflowRunAttempt() {
            return { data: { run_started_at: '2020-01-22T19:33:08Z' } }
          }
        }
      }
    }
    ;(getOctokit as jest.Mock).mockReturnValueOnce(mockOctokit)

    // mock getInput
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
})
