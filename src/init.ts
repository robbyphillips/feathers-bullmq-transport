import { Application } from '@feathersjs/feathers'
import { Worker, WorkerOptions } from 'bullmq'
import { MethodName } from './common'
import { makeRouter, makeServiceLookup } from './router'

export interface IConfig {
  /** Name of the queue that the worker should watch */
  queueName: string

  /** BullMQ Worker configuration */
  workerConfig?: WorkerOptions

  /**
   * Dictionary where the keys are services that should be mapped to by this
   * transport and the values are arrays of the service method names.
   * If not provided, all methods on all services will be mapped.
   * ```
   * {
   *   users: ['create'],
   *   notes: ['create', 'update', 'patch', 'remove']
   * }
   * ```
   */
  services?: Record<string, MethodName[]>
}

export function init(opts: IConfig): (app: Application) => Worker {
  return (app: Application) => {
    const appServices = Object.keys(app.services)
    const serviceLookup = opts.services || makeServiceLookup(appServices)

    const routerFn = makeRouter(app, serviceLookup)

    return new Worker(opts.queueName, routerFn, opts.workerConfig)
  }
}
