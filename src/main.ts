import * as core from '@actions/core'
import * as github from '@actions/github'
import { createWorkflowEvent, pushToTinybird } from './tb'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get Start and End time of current workflow
    const octokit = github.getOctokit(core.getInput('github_token'))
    const attempt_number = parseInt(
      process.env.GITHUB_RUN_ATTEMPT as string,
      10
    )

    const response = await octokit.rest.actions.getWorkflowRunAttempt({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      run_id: github.context.runId,
      attempt_number
    })

    const started_at = response.data.run_started_at
    if (!started_at) {
      throw new Error('Could not get the start time of the workflow')
    }
    const now = new Date().toISOString()

    const status = response.data.status ? response.data.status : 'unknown'

    const workflow_id: string = core.getInput('workflow_id')
    const workflowEvent = await createWorkflowEvent(
      started_at,
      now,
      workflow_id,
      status
    )

    const tb_token: string = core.getInput('tinybird_token')
    const tb_datasource: string = core.getInput('tinybird_datasource')
    core.setSecret(tb_token)

    if (!tb_datasource || !tb_token) {
      core.setFailed('Tinybird datasource and token must be provided')
    } else {
      await pushToTinybird(workflowEvent, tb_token, tb_datasource)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
