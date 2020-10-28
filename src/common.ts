export const METHOD_NAMES = ['create', 'patch', 'update', 'remove'] as const

export type MethodName = typeof METHOD_NAMES[number]

export type ServiceLookup = Record<string, MethodName[]>
