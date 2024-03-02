# Create a GitHub Action Using TypeScript

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)

# LaunchDarkly Feature Flags Ready For Removal Action

## Overview

This GitHub Action automates the process of identifying feature flags that are ready for removal based on specified criteria. It generates a report of such feature flags, which can be sent to designated channels such as Slack.

## Usage

To use this action, you need to specify the following parameters:

- `access-token`: The access token for authentication with LaunchDarkly.
- `project-key`: The project key for accessing the LaunchDarkly project.
- `environment-key`: The environment key for the LaunchDarkly environment.
- `maintainer-teams`: The teams responsible for maintaining the feature flags.
- `threshold`: The threshold in days for considering a feature flag as ready for removal.
- `report-type`: The type of report to generate (e.g., 'slack' or 'default').
- `excluded-tags`: Any tags to be excluded from consideration for removal.
- `slack-webhook`: The Slack webhook for sending the report.

### Trigger

This action can be triggered on a schedule or manually.

- **Schedule:** It runs on a weekly schedule every Friday at 11:00 AM UTC.
- **Manual:** You can also trigger the action manually through GitHub's workflow dispatch feature.

## Example Workflow

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

## Notes
- Ensure that all secrets (e.g., ACCESS_TOKEN, PROJECT_KEY, LD_ENV, SLACK_WEBHOOK) are properly configured in your repository's secrets settings.
- This action helps streamline the process of identifying and managing outdated feature flags in your LaunchDarkly environment.
