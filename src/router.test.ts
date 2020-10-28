import { makeRouter } from './router'
import { Application } from '@feathersjs/feathers'
import feathers from '@feathersjs/feathers'
import { Job } from 'bullmq'

let app: Application
// let routerFn: IRouterFn

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getMockService = () => ({
  create: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  patch: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve()),
})

beforeEach(() => {
  app = feathers()
  app.use('/one', getMockService())
  app.use('/two', getMockService())
})

describe('makeRouter', () => {
  it('returns a function', () => {
    const router = makeRouter(app)
    expect(typeof router).toBe('function')
  })
})

describe('routerFn', () => {
  it('calls the create service method', async () => {
    const routerFn = makeRouter(app)
    const job = { name: 'one:create', data: { text: 'stuff' } } as Job
    await routerFn(job)

    const mocked = app.service('one').create

    expect(mocked.mock.calls.length).toBe(1)
    expect(mocked.mock.calls[0][0].text).toBe('stuff')
  })

  it('calls the update service method', async () => {
    const routerFn = makeRouter(app)
    const job = { name: 'one:update:123', data: { text: 'stuff' } } as Job
    await routerFn(job)

    const mocked = app.service('one').update

    expect(mocked.mock.calls.length).toBe(1)
    expect(mocked.mock.calls[0][0]).toBe(123)
    expect(mocked.mock.calls[0][1].text).toBe('stuff')
  })

  it('calls the patch service method', async () => {
    const routerFn = makeRouter(app)
    const job = { name: 'one:patch:123', data: { text: 'stuff' } } as Job
    await routerFn(job)

    const mocked = app.service('one').patch

    expect(mocked.mock.calls.length).toBe(1)
    expect(mocked.mock.calls[0][0]).toBe(123)
    expect(mocked.mock.calls[0][1].text).toBe('stuff')
  })

  it('calls the remove service method', async () => {
    const routerFn = makeRouter(app)
    const job = { name: 'one:remove:123', data: {} } as Job
    await routerFn(job)

    const mocked = app.service('one').remove

    expect(mocked.mock.calls.length).toBe(1)
    expect(mocked.mock.calls[0][0]).toBe(123)
  })

  it('works with a different ServiceLookup', async () => {
    const routerFn = makeRouter(app, { one: ['create'] })
    const job = { name: 'one:create', data: { text: 'stuff' } } as Job
    await routerFn(job)

    const mocked = app.service('one').create

    expect(mocked.mock.calls.length).toBe(1)
    expect(mocked.mock.calls[0][0].text).toBe('stuff')
  })

  it('throws for an unknown service', async () => {
    const routerFn = makeRouter(app)
    const job = { name: 'unknown:patch:123', data: {} } as Job

    await expect(routerFn(job)).rejects.toThrow('Invalid')
  })

  it('throws for an unregistered service', async () => {
    const routerFn = makeRouter(app, { one: ['create'] })
    const job = { name: 'two:patch:123', data: {} } as Job

    await expect(routerFn(job)).rejects.toThrow('Invalid')
  })

  it('throws for a not allowed method', async () => {
    const routerFn = makeRouter(app, { one: ['create'] })
    const job = { name: 'one:patch:123', data: {} } as Job

    await expect(routerFn(job)).rejects.toThrow('Invalid')
  })
})
