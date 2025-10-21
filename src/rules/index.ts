import { FeatureFlag } from '../types'
import { differenceInCalendarDays } from 'date-fns'
import * as core from '@actions/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rule = (flag: FeatureFlag, ...args: any[]) => boolean

const isRuleEnabled = (ruleName: string): boolean => {
    const enabledRulesInput = core.getInput('enabled-rules')
    const enabledRules = enabledRulesInput.split(',').map(rule => rule.trim())
    return enabledRules.includes(ruleName)
}

const isNotPermanent: Rule = (flag: FeatureFlag): boolean => {
    if (!isRuleEnabled('not-permanent')) {
        return true
    }

    core.debug(`Rule - isNotPermanent: ${flag.key} ${flag.temporary}`)
    return flag.temporary
}

const isNotMultivariate: Rule = (flag: FeatureFlag): boolean => {
    if (!isRuleEnabled('not-multivariate')) {
        return true
    }

    core.debug(`Rule - isNotMultivariate: ${flag.key} ${flag.kind}`)
    return flag.kind === 'boolean'
}

const isNotExcludedByTags: Rule = (flag: FeatureFlag): boolean => {
    if (!isRuleEnabled('not-excluded-by-tags')) {
        return true
    }

    core.debug(`Rule - isExcludedByTag: ${flag.key} ${flag.tags}`)
    const excludedTags: string[] = core.getInput('excluded-tags')?.split(',')

    return flag.tags.every(tag => !excludedTags.includes(tag))
}

const isNotNewlyCreated: Rule = (flag: FeatureFlag): boolean => {
    if (!isRuleEnabled('not-newly-created')) {
        return true
    }

    const threshold = Number(core.getInput('threshold'))
    const createdDate = new Date(flag.creationDate)
    const diffInDays = differenceInCalendarDays(Date.now(), createdDate)

    core.debug(`Rule - isNotNewlyCreated: ${flag.key} ${diffInDays}`)

    return diffInDays >= threshold
}

const dontHaveCodeReferences: Rule = (flag: FeatureFlag): boolean => {
    if (!isRuleEnabled('no-code-references')) {
        return false
    }

    core.debug(
        `Rule - dontHaveCodeReferences: ${flag.key} ${flag.codeReferences?.items?.length}`
    )

    return flag.codeReferences?.items?.length === 0
}

const doesHaveOnlyDefaultVariation: Rule = (flag: FeatureFlag): boolean => {
    if (!isRuleEnabled('default-variation-only')) {
        return false
    }

    const environment: string = core.getInput('environment-key')
    const currentEnvironment = flag.environments[environment]?._summary

    if (!currentEnvironment?.variations || currentEnvironment.prerequisites > 0)
        return false

    const variations = Object.values(currentEnvironment.variations)

    // Filtering non-empty variations
    const targetedVariations = variations.filter(variation => {
        return (
            variation?.targets ||
            variation?.rules ||
            variation?.contextTargets ||
            variation?.nullRules
        )
    })

    core.debug(
        `Rule - doesHaveOnlyDefaultVariation: ${flag.key} ${JSON.stringify(targetedVariations)}`
    )

    // If a single variation is targeted check if it's enabled by default
    if (targetedVariations.length === 1) {
        const [targetedVariation] = targetedVariations

        return Boolean(targetedVariation.isFallthrough)
    }

    if (targetedVariations.length === 0) {
        return true
    }

    return false
}

export const runRulesEngine = (featureFlags: FeatureFlag[]): FeatureFlag[] => {
    const enabledRulesInput = core.getInput('enabled-rules')
    const enabledRules = enabledRulesInput.split(',').map(rule => rule.trim())

    core.info(`Enabled rules: ${enabledRules.join(', ')}`)

    return featureFlags.filter(featureFlag => {
        core.debug(`########### ${featureFlag.key} ########### `)

        if (
            !isNotNewlyCreated(featureFlag) ||
            !isNotExcludedByTags(featureFlag) ||
            !isNotPermanent(featureFlag) ||
            !isNotMultivariate(featureFlag)
        ) {
            return false
        }

        return (
            dontHaveCodeReferences(featureFlag) ||
            doesHaveOnlyDefaultVariation(featureFlag)
        )
    })
}
