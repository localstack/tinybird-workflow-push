import * as core from '@actions/core'
import * as github from '@actions/github'

type WorkflowEvent = {
  run_id: number
  start: string
  end: string
  commit: string
  branch: string
  workflow: string
  repository: string
  attempt: number
}

export async function createWorkflowEvent(
  start: string,
  end: string
): Promise<WorkflowEvent> {
  const event: WorkflowEvent = {
    run_id: github.context.runId,
    start,
    end,
    commit: github.context.sha,
    branch: github.context.ref.split('/').pop() || '',
    workflow: github.context.workflow,
    repository: `${github.context.repo.owner}/${github.context.repo.repo}`,
    attempt: parseInt(process.env.GITHUB_RUN_ATTEMPT as string, 10)
  }
  return event
}

export async function pushToTinybird(
  data: WorkflowEvent,
  tb_token: string,
  tb_endpoint: string
): Promise<void> {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${tb_token}`)

  core.info(
    `Pushing ${JSON.stringify(data)} to Tinybird endpoint: ${tb_endpoint}`
  )
  const response = await fetch(tb_endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error(
      `Tinybird push failed with status ${response.status} (${response.statusText})`
    )
  }
  const responseText = await response.text()
  core.info(`Tinybird push response: ${responseText}`)
}
