import { MethodName, METHOD_NAMES } from './common'

type NullableId = string | number | null
type ParseResult =
  | [string, Exclude<MethodName, 'create'>, NullableId]
  | [string, 'create']

function isMethodName(str: string): str is MethodName {
  return METHOD_NAMES.some((m) => m === str)
}

export function parseJobName(name: string, services?: string[]): ParseResult {
  const parts = name.split(':')
  const [serviceName, method, id] = parts

  if (
    !isMethodName(method) ||
    (method === 'create' && parts.length !== 2) ||
    (method !== 'create' && parts.length !== 3)
  ) {
    throw new Error(`Invalid job name, bad method or arguments: ${name}`)
  }

  if (services && !services.includes(serviceName)) {
    throw new Error(`Invalid job name, service not found: ${name}`)
  }

  if (method === 'create') {
    return [serviceName, 'create']
  }

  return [serviceName, method, parseId(id)]
}

function parseId(id: string): NullableId {
  if (id === 'null') {
    return null
  }

  const num = parseInt(id, 10)

  if (Number.isNaN(num)) {
    return id
  }

  return num
}
