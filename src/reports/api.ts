import axios from 'axios'
import * as core from '@actions/core'
import { FeatureFlag, MaintainerTeam } from '../types'

type Payload = {
    maintainerTeam: MaintainerTeam
    featureFlags: string[]
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

const buildPayload = (groupedData: GroupedData[]): Payload[] =>
    groupedData.map(({ maintainerTeam, flags }) => ({
        maintainerTeam,
        featureFlags: flags.map(flag => flag.key)
    }))

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

        core.info(
            `Sending ${payload.length} team(s) data to API: ${JSON.stringify(payload)}`
        )

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(apiToken && { Authorization: `Bearer ${apiToken}` })
        }

        await axios.post(apiUrl, payload, { headers })

        core.info('Successfully sent data to API')
    }
}
