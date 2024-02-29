export type Variation = {
    isFallthrough: boolean // Default Value of the flag
    targets: number
    rules: number
    contextTargets: number
}

export type Environment = {
    _summary: {
        variations: Record<string, Variation>
    }
}

export type FeatureFlag = {
    _maintainerTeam: {
        key: string
        name: string
    }
    creationDate: string
    defaults: {
        offVariation: number
        onVariation: number
    }
    key: string
    kind: string
    maintainerTeamKey: string
    name: string
    tags: string[]
    temporary: boolean
    environments: Record<string, Environment>
    codeReferences: {
        items: { sourceLink: string }[]
    }
}
