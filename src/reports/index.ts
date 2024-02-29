import { slackReport } from './slack'
import { FeatureFlag } from '../types'
import { defaultReport } from './default'

type Reporter = {
    run: (
        featureFlags: FeatureFlag[],
        options: Record<string, string>
    ) => Promise<void>
}

const REPORTS: Record<string, Reporter> = {
    slack: slackReport,
    default: defaultReport
}

export const getReportByType = (type: string): Reporter =>
    REPORTS[type] ?? REPORTS.default
