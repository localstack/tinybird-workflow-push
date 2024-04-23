# Push GitHub Action workflow run attempt data to Tinybird

This GitHub action enables you to send GitHub workflow run statistics to
[Tinybird](https://www.tinybird.co/). The format in which the data is sent is as follows:

```json
  {
    "run_id": "The GitHub run ID as a string",
    "start": "The start time of the workflow run",
    "end": "The time of the execution of the action (end of the run)",
    "commit": "The commit hash of the commit the workflow is executed on",
    "branch": "The branch on which the workflow is executed", 
    "workflow": "The name of the workflow",
    "repository": "The repository in the format <owner>/<repo-name>",
    "attempt": "The number of the run attempt",
    "outcome": "'failure' if at least one job failed, 'success' otherwise",
    "workflow_url": "The URL to the workflow run attempt this payload describes"
  }
```

## Usage
Add this action as the last one in your step like this:
```yaml
steps:
  - name: Push to Tinybird
    if: always()
    uses: localstack/tinybird-workflow-push@v3
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      tinybird_token: ${{ secrets.TINYBIRD_TOKEN }}
      tinybird_datasource: <your-data-source>
      workflow_id: <custom-workflow-id>
```

> [!IMPORTANT]
> Make sure to set the right conditions and dependencies on the step / job.

- `if: always()` is necessary to also execute this step in case a previous step already failed (otherwise this step would be skipped and `failure` workflow data will never be sent).
- If you have this action in an explicit job, make sure to also define the `always()` condition _and_ set the all previous jobs as dependencies on for the job:
  ```yaml
  jobs:
    ...
    push-to-tinybird:
      if: always()
      needs:
        - <previous-jobs>
      steps:
        - name: Push to Tinybird
          ...
  ```

### Usage in callable workflows
In callable workflows, the usual outcome detection might not work correctly, since the job outcome of all jobs in the composite workflow would be detected.
It also isn't possible to access the `needs` context from within the GitHub action in order to analyze only the outcome of the dependencies of this specific sub-workflow.
We introduced the `outcome` input for this usecase to manually set a outcome which should be sent to Tinybird:
```yaml
steps:
  - name: Push to Tinybird
    if: always()
    uses: localstack/tinybird-workflow-push@v3
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      tinybird_token: ${{ secrets.TINYBIRD_TOKEN }}
      tinybird_datasource: <your-data-source>
      workflow_id: <custom-workflow-id>
      outcome: ${{ (contains(needs.*.result, 'failure') && "failure") || "success" }}
```

## Inputs

### `github_token`

**Required**: This token is used to access the GitHub API to access the start time of the workflow run.

### `tinybird_token`

**Required**: This token is used to authenticate with Tinybird.

### `tinybird_datasource`

**Required**: This is the endpoint to which the workflow run data should be pushed to. (default: `ci_workflows`)

### `workflow_id`

**Optional**: This is the ID of the workflow sent to tinybird. (default: the output of `github.context.workflow`)

### `outcome`

**Optional**: Optional input to manually override the outcome reported to Tinybird.
(default: the outcome is calculated using the worst outcome of all jobs in the current workflow run attempt)
