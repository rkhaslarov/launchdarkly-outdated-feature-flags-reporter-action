import * as core from '@actions/core'
import { slackReport } from './slack'
import { apiReport } from './api'
import { FeatureFlag } from '../types'
import { defaultReport } from './default'

type Reporter = {
    run: (featureFlags: FeatureFlag[]) => Promise<void>
}

const REPORTS: Record<string, Reporter> = {
    slack: slackReport,
    api: apiReport,
    default: defaultReport
}

export const getReportByType = (): Reporter => {
    const webhookUrl = core.getInput('webhook-url')

    if (!webhookUrl) {
        core.info('No webhook URL provided, using default report type')
        return REPORTS.default
    }

    // Auto-detect Slack webhooks
    if (webhookUrl.includes('hooks.slack.com')) {
        core.info('Auto-detected report type: slack')
        return REPORTS.slack
    }

    // Treat all other URLs as custom API endpoints
    core.info('Auto-detected report type: api')
    return REPORTS.api
}
