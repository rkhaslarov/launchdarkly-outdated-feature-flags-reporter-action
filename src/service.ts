import axios from 'axios'
import { FeatureFlag } from './types'

const url = 'https://app.launchdarkly.com/api/v2/flags'

export const getFeatureFlags = async ({
    accessToken,
    projectKey,
    environment,
    filters
}: {
    accessToken: string
    projectKey: string
    environment: string
    filters: string
}): Promise<FeatureFlag[]> => {
    const { data } = await axios.get<{ items: FeatureFlag[] }>(
        `${url}/${projectKey}?env=${environment}&archived=false&filter=${filters}&expand=codeReferences`,
        {
            headers: {
                Authorization: accessToken
            }
        }
    )

    return data?.items ?? []
}

export const getFeatureFlagsByMaintainerTeams = async ({
    accessToken,
    projectKey,
    environment,
    maintainerTeams,
}: {
    accessToken: string
    projectKey: string
    environment: string
    maintainerTeams: string[]
}): Promise<FeatureFlag[]> => {
    const response = await Promise.all(
        maintainerTeams.map(async team =>
            getFeatureFlags({
                accessToken,
                projectKey,
                environment,
                filters: `maintainerTeamKey:${team}`
            })
        )
    )

    return response.flat()
}
