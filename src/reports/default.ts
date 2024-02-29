import { FeatureFlag } from '../types'
import * as core from '@actions/core'

export const defaultReport = {
    async run(featureFlags: FeatureFlag[], options: Record<string, string>) {
        core.info(
            `Default reporter output: ${JSON.stringify(featureFlags)} and options ${JSON.stringify(options)}`
        )
    }
}
