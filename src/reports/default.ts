import { FeatureFlag } from '../types'
import * as core from '@actions/core'

export const defaultReport = {
    async run(featureFlags: FeatureFlag[]) {
        core.info(`Default reporter output: ${JSON.stringify(featureFlags)}}`)
    }
}
