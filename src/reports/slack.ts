import axios from 'axios'
import * as core from '@actions/core'
import { FeatureFlag } from '../types'
import { formatDistance } from 'date-fns'

export interface BlockMessage {
    username: string
    icon_emoji: string
    blocks: object[]
}

function groupFeatureFlagsByMaintainerTeam(
    featureFlags: FeatureFlag[]
): Record<string, FeatureFlag[]> {
    return featureFlags.reduce(
        (acc, cur) => {
            if (acc[cur._maintainerTeam.name]) {
                acc[cur._maintainerTeam.name].push(cur)
            } else {
                acc[cur._maintainerTeam.name] = [cur]
            }

            return acc
        },
        {} as Record<string, FeatureFlag[]>
    )
}

function formatFeatureFlag(
    featureFlag: FeatureFlag,
    options: { url: string }
): string {
    const createdDate = new Date(featureFlag.creationDate)
    const distance = formatDistance(createdDate, new Date(), {
        addSuffix: true
    })

    return `\n📌 <${options.url}${featureFlag.key}|${featureFlag.key}> | ${distance}`
}

function formatMaintainerTeam(maintainerTeam: string): string {
    return `\n👤 *${maintainerTeam}*: `
}

export function formatFeatureFlags(
    groupedFeatureFlags: Record<string, FeatureFlag[]>,
    options: { url: string }
): object[] {
    return Object.keys(groupedFeatureFlags).map((maintainerTeam: string) => {
        const text = formatMaintainerTeam(maintainerTeam).concat(
            groupedFeatureFlags[maintainerTeam]
                .map(featureFlag => formatFeatureFlag(featureFlag, options))
                .join('')
        )

        return {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text
            }
        }
    })
}

export function formatSlackMessage(
    blocks: object[],
    count: number
): BlockMessage {
    return {
        username: 'PR Reporter',
        icon_emoji: ':rolled_up_newspaper:',
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `\n Please note that there are ${count} Feature Flags scheduled for removal, and we kindly request your review.`
                }
            },
            {
                type: 'divider'
            },
            ...blocks,
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: "Handle them with care during review, and consider archiving if they aren't in active use by other consumers. Otherwise, use *excluded-tags* option for manage flag manually."
                }
            },
            {
                type: 'divider'
            }
        ]
    }
}

export const slackReport = {
    async run(featureFlags: FeatureFlag[]) {
        const slackWebhook: string = core.getInput('slack-webhook')
        const projectKey: string = core.getInput('project-key')
        const environment: string = core.getInput('environment-key')

        const url = `https://app.launchdarkly.com/${projectKey}/${environment}/features/`
        const groupedFeatureFlags =
            groupFeatureFlagsByMaintainerTeam(featureFlags)
        const blocks = formatFeatureFlags(groupedFeatureFlags, { url })
        const message = formatSlackMessage(blocks, featureFlags.length)

        core.info(
            `Sending message to Slack webhook: ${JSON.stringify(message)}`
        )

        await axios.post(slackWebhook, message)
    }
}
