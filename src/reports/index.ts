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

export const getReportByType = (type: string): Reporter =>
    REPORTS[type] ?? REPORTS.default
