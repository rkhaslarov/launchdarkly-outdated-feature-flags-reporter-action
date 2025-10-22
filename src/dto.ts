import * as core from '@actions/core'
import { FeatureFlag } from './types'

export type FeatureFlagDto = {
    key: string
    creationDate: string
    link: string
}

export const toFeatureFlagDto = (flag: FeatureFlag): FeatureFlagDto => {
    const projectKey = core.getInput('project-key')
    const environment = core.getInput('environment-key')

    return {
        key: flag.key,
        creationDate: flag.creationDate,
        link: `https://app.launchdarkly.com/${projectKey}/${environment}/features/${flag.key}`
    }
}
