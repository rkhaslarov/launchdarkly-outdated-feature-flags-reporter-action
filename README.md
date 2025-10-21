# LaunchDarkly Feature Flags Ready For Removal Action

[![GitHub Super-Linter](https://github.com/rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action/actions/workflows/codeql-analysis.yml)

## Overview

This GitHub Action automates the process of identifying feature flags that
are ready for removal based on specified criteria.
It generates a report of such feature flags, which can be sent
to designated channels such as Slack or a custom API endpoint.

## Usage

To use this action, you need to specify the following parameters:

- `access-token`: The access token for authentication with LaunchDarkly.
- `project-key`: The project key for accessing the LaunchDarkly project.
- `environment-key`: The environment key for the LaunchDarkly environment.
- `maintainer-teams`: The teams responsible for maintaining the feature flags.
- `threshold`: The threshold in days for considering a feature flag as ready
   for removal.
- `report-type`: The type of report to generate (e.g., 'slack', 'api', or 'default').
- `excluded-tags`: Any tags to be excluded from consideration for removal.
- `enabled-rules`: Comma-separated list of rules to enable. Available rules:
  - **Filter Rules** (must pass ALL enabled filter rules):
    - `not-newly-created`: Filters out flags created within the threshold period
    - `not-excluded-by-tags`: Filters out flags with excluded tags
    - `not-permanent`: Filters out permanent flags (only includes temporary flags)
    - `not-multivariate`: Filters out multivariate flags (only includes boolean flags)
  - **Detection Rules** (must pass at least ONE enabled detection rule):
    - `no-code-references`: Flags feature flags with no code references
    - `default-variation-only`: Flags feature flags with only default variation
  - Default: All rules enabled
- `slack-webhook`: The Slack webhook for sending the report (required when report-type is 'slack').
- `api-url`: The API endpoint URL for sending the report (required when report-type is 'api').
- `api-token`: The API authentication token (optional, used when report-type is 'api').

### Trigger

This action can be triggered on a schedule or manually.

- **Schedule:** It runs on a weekly schedule every Friday at 11:00 AM UTC.
- **Manual:** You can also trigger the action manually through
  GitHub's workflow dispatch feature.

## Example Workflows

### Slack Report

```yaml
name: Feature Flags Ready For Removal
on:
  schedule:
    - cron: "00 11 * * 5"
  workflow_dispatch:

jobs:
  send-feature-flags-report:
    name: Feature Flags
    runs-on: ubuntu-latest
    steps:
      - name: 'Send Report'
        uses: rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action@v1.0.0
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
          project-key: ${{ secrets.PROJECT_KEY }}
          environment-key: ${{ secrets.LD_ENV }}
          maintainer-teams: 'team'
          threshold: 30
          report-type: 'slack'
          excluded-tags: 'MANUAL_REVIEW'
          slack-webhook: ${{ secrets.SLACK_WEBHOOK }}
```

### API Report

```yaml
name: Feature Flags Ready For Removal
on:
  schedule:
    - cron: "00 11 * * 5"
  workflow_dispatch:

jobs:
  send-feature-flags-report:
    name: Feature Flags
    runs-on: ubuntu-latest
    steps:
      - name: 'Send Report'
        uses: rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action@v1.0.0
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
          project-key: ${{ secrets.PROJECT_KEY }}
          environment-key: ${{ secrets.LD_ENV }}
          maintainer-teams: 'team'
          threshold: 30
          report-type: 'api'
          excluded-tags: 'MANUAL_REVIEW'
          api-url: ${{ secrets.API_URL }}
          api-token: ${{ secrets.API_TOKEN }}
```

### Custom Rules Configuration

You can enable specific rules by providing a comma-separated list:

```yaml
name: Feature Flags Ready For Removal
on:
  schedule:
    - cron: "00 11 * * 5"
  workflow_dispatch:

jobs:
  send-feature-flags-report:
    name: Feature Flags
    runs-on: ubuntu-latest
    steps:
      # Example 1: Only check for flags with no code references (skip all filters)
      - name: 'Send Report - Only No Code References'
        uses: rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action@v1.0.0
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
          project-key: ${{ secrets.PROJECT_KEY }}
          environment-key: ${{ secrets.LD_ENV }}
          maintainer-teams: 'team'
          threshold: 30
          report-type: 'slack'
          slack-webhook: ${{ secrets.SLACK_WEBHOOK }}
          enabled-rules: 'no-code-references'
      
      # Example 2: Only temporary boolean flags with default variation
      - name: 'Send Report - Temporary Boolean Flags'
        uses: rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action@v1.0.0
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
          project-key: ${{ secrets.PROJECT_KEY }}
          environment-key: ${{ secrets.LD_ENV }}
          maintainer-teams: 'team'
          threshold: 30
          report-type: 'slack'
          slack-webhook: ${{ secrets.SLACK_WEBHOOK }}
          enabled-rules: 'not-permanent,not-multivariate,default-variation-only'
      
      # Example 3: Old flags (30+ days) with no code references, regardless of type
      - name: 'Send Report - Old Flags No Code'
        uses: rkhaslarov/launchdarkly-outdated-feature-flags-reporter-action@v1.0.0
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
          project-key: ${{ secrets.PROJECT_KEY }}
          environment-key: ${{ secrets.LD_ENV }}
          maintainer-teams: 'team'
          threshold: 30
          report-type: 'slack'
          slack-webhook: ${{ secrets.SLACK_WEBHOOK }}
          enabled-rules: 'not-newly-created,no-code-references'
```

## API Report Format

When using the `api` report type, the action will send a POST request to the specified API endpoint with the following payload format:

```json
[
  {
    "maintainerTeam": {
      "key": "team-key-1",
      "name": "Team Name 1"
    },
    "featureFlags": ["flag-key-1", "flag-key-2", "flag-key-3"]
  },
  {
    "maintainerTeam": {
      "key": "team-key-2",
      "name": "Team Name 2"
    },
    "featureFlags": ["flag-key-4", "flag-key-5"]
  }
]
```

If an `api-token` is provided, it will be sent as a Bearer token in the Authorization header.

## Notes

- Ensure that all secrets (e.g., ACCESS_TOKEN, PROJECT_KEY, LD_ENV, SLACK_WEBHOOK, API_URL, API_TOKEN)
  are properly configured in your repository's secrets settings.
- This action helps streamline the process of identifying and managing outdated
  feature flags in your LaunchDarkly environment.
