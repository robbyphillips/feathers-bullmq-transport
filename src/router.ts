import { Application } from '@feathersjs/feathers'
import { Job } from 'bullmq'
import { METHOD_NAMES, ServiceLookup } from './common'
import { parseJobName } from './parse-job-name'

export function makeServiceLookup(services: string[]): ServiceLookup {
  const lookup: ServiceLookup = {}
  for (const name of services) {
    lookup[name] = [...METHOD_NAMES]
  }

  return lookup
}

export interface IRouterFn {
  (job: Job): Promise<void>
}

export function makeRouter(
  app: Application,
  lookup?: ServiceLookup
): IRouterFn {
  const _lookup = lookup || makeServiceLookup(Object.keys(app.services))

  const validServices = Object.keys(_lookup)

  return async function (job: Job) {
    const [serviceName, methodName, id] = parseJobName(job.name, validServices)
    const allowedMethods = _lookup[serviceName]

    if (!allowedMethods.includes(methodName)) {
      throw new Error(`Invalid job name, method not allowed: ${methodName}`)
    }

    if (methodName === 'create') {
      return app.service(serviceName).create(job.data)
    }

    return app.service(serviceName)[methodName](id, job.data)
  }
}
