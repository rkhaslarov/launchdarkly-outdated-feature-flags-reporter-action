import { FeatureFlag } from './types'
import { differenceInCalendarDays } from 'date-fns'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rule = (flag: FeatureFlag, ...args: any[]) => boolean

const isNotPermanent: Rule = (flag: FeatureFlag): boolean => {
    return flag.temporary
}

const isNotMultivariate: Rule = (flag: FeatureFlag): boolean => {
    return flag.kind === 'boolean'
}

const isNotNewlyCreated: Rule = (flag: FeatureFlag, maxDays = 30): boolean => {
    const createdDate = new Date(flag.creationDate)
    const diffInDays = differenceInCalendarDays(createdDate, Date.now())

    return diffInDays >= maxDays
}

const dontHaveCodeReferences: Rule = (flag: FeatureFlag): boolean => {
    return flag.codeReferences.items.length === 0
}

const isEnabledByDefaultAndNoOffVariationTargets: Rule = (
    flag: FeatureFlag,
    environment: string
): boolean => {
    const currentEnvironment = flag.environments[environment]?._summary

    if (!currentEnvironment) return false

    const variations = currentEnvironment.variations
    const defaults = flag.defaults

    const isEnabledByDefault = variations[defaults.onVariation]?.isFallthrough

    if (isEnabledByDefault) {
        const offVariation = variations[defaults.offVariation]

        return (
            !offVariation?.targets &&
            !offVariation?.rules &&
            !offVariation?.contextTargets
        )
    }

    return false
}

const isDisabledByDefaultAndNoOnVariationTargets: Rule = (
    flag: FeatureFlag,
    environment: string
): boolean => {
    const currentEnvironment = flag.environments[environment]?._summary

    if (!currentEnvironment) return false

    const variations = currentEnvironment.variations
    const defaults = flag.defaults

    const isDisabledByDefault = variations[defaults.offVariation]?.isFallthrough

    if (isDisabledByDefault) {
        const onVariation = variations[defaults.onVariation]

        return (
            !onVariation?.targets &&
            !onVariation?.rules &&
            !onVariation?.contextTargets
        )
    }

    return false
}

export const runRulesEngine = (featureFlags: FeatureFlag[]): FeatureFlag[] =>
    featureFlags.filter(featureFlag => {
        if (
            isNotNewlyCreated(featureFlag) &&
            isNotMultivariate(featureFlag) &&
            isNotPermanent(featureFlag)
        ) {
            return (
                dontHaveCodeReferences(featureFlag) ||
                isDisabledByDefaultAndNoOnVariationTargets(featureFlag) ||
                isEnabledByDefaultAndNoOffVariationTargets(featureFlag)
            )
        }

        return false
    })
