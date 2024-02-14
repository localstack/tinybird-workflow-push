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
    "attempt": "The number of the run attempt"
  }
```

## Usage

Add this action as the last step of your last job, provide the automatic `GITHUB_TOKEN` secret,
your Tinybird token and the Event API endpoint to which to push the data

```yaml
steps:
   - uses: localstack/tinybird-workflow-push@v1
     with:
       github_token: ${{ secrets.GITHUB_TOKEN }}
       tinybird_token: ${{ secrets.TINYBIRD_TOKEN }}
       tinybird_endpoint: "https://api.tinybird.co/v0/events?name=<your-data-source>"
```

## Inputs

### `github_token`

**Required**: This token is used to access the GitHub API to access the start time of the workflow run.

### `tinybird_token`

**Required**: This token is used to authenticate with Tinybird.

### `tinybird_endpoint`

**Required**: This is the endpoint to which the workflow run data should be pushed to.
