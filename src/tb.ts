import * as core from '@actions/core'
import * as github from '@actions/github'

type WorkflowEvent = {
  run_id: string
  start: string
  end: string
  commit: string
  branch: string
  workflow: string
  repository: string
  attempt: number
  outcome: string
  workflow_url: string
}

export async function createWorkflowEvent(
  start: string,
  end: string,
  workflow_id = '',
  outcome: string
): Promise<WorkflowEvent> {
  const attempt = parseInt(process.env.GITHUB_RUN_ATTEMPT as string, 10)
  const event: WorkflowEvent = {
    run_id: github.context.runId.toString(),
    start,
    end,
    commit: github.context.sha,
    branch: github.context.ref.split('/').pop() || '',
    workflow: workflow_id === '' ? github.context.workflow : workflow_id,
    repository: `${github.context.repo.owner}/${github.context.repo.repo}`,
    attempt,
    outcome,
    workflow_url: `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${github.context.runId}/attempts/${attempt}`
  }
  return event
}

export async function pushToTinybird(
  data: WorkflowEvent,
  tb_token: string,
  tb_datasource: string
): Promise<void> {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${tb_token}`)

  core.info(
    `Pushing ${JSON.stringify(data)} to Tinybird datasource: ${tb_datasource}`
  )

  const response = await fetch(
    `https://api.tinybird.co/v0/events?name=${tb_datasource}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    }
  )
  if (!response.ok) {
    throw new Error(
      `Tinybird push failed with status ${response.status} (${response.statusText})`
    )
  }
  const responseText = await response.text()
  core.info(`Tinybird push response: ${responseText}`)
}
