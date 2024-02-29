import { slackReport } from './slack'
import { FeatureFlag } from '../types'
import { defaultReport } from './default'

type Reporter = {
    run: (featureFlags: FeatureFlag[]) => Promise<void>
}

const REPORTS: Record<string, Reporter> = {
    slack: slackReport,
    default: defaultReport
}

export const getReportByType = (type: string): Reporter =>
    REPORTS[type] ?? REPORTS.default
