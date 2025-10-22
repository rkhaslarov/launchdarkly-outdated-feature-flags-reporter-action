import axios from 'axios'
import * as core from '@actions/core'
import { FeatureFlag, MaintainerTeam } from '../types'
import { toFeatureFlagDto, FeatureFlagDto } from '../dto'

type Payload = {
    maintainerTeam: MaintainerTeam
    featureFlags: FeatureFlagDto[]
}

type GroupedData = {
    maintainerTeam: MaintainerTeam
    flags: FeatureFlag[]
}

const groupByMaintainerTeam = (featureFlags: FeatureFlag[]): GroupedData[] => {
    const grouped = featureFlags.reduce(
        (acc, flag) => {
            const teamKey = flag._maintainerTeam.key
            if (!acc[teamKey]) {
                acc[teamKey] = {
                    maintainerTeam: {
                        key: flag._maintainerTeam.key,
                        name: flag._maintainerTeam.name
                    },
                    flags: []
                }
            }
            acc[teamKey].flags.push(flag)
            return acc
        },
        {} as Record<string, GroupedData>
    )

    return Object.values(grouped)
}

const buildPayload = (groupedData: GroupedData[]): Payload[] => {
    return groupedData.map(({ maintainerTeam, flags }) => ({
        maintainerTeam,
        featureFlags: flags.map(flag => toFeatureFlagDto(flag))
    }))
}

export const apiReport = {
    async run(featureFlags: FeatureFlag[]) {
        const apiUrl = core.getInput('api-url')
        const apiToken = core.getInput('api-token')

        if (!apiUrl) {
            core.warning('api-url input is not provided, skipping API report')
            return
        }

        const groupedFlags = groupByMaintainerTeam(featureFlags)
        const payload = buildPayload(groupedFlags)
        const response = JSON.stringify(payload)

        core.info(`Sending ${payload.length} team(s) data to API: ${response}`)

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(apiToken && { Authorization: `Bearer ${apiToken}` })
        }

        await axios.post(apiUrl, response, { headers })

        core.info('Successfully sent data to API')
    }
}
