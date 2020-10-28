import { parseJobName } from './parse-job-name'

describe('parseJobName', () => {
  describe('returns correctly for valid job names', () => {
    test.each([
      ['service-name:create', ['service-name', 'create']],
      ['service-name:patch:idstring', ['service-name', 'patch', 'idstring']],
      ['service-name:update:idstring', ['service-name', 'update', 'idstring']],
      ['service-name:remove:idstring', ['service-name', 'remove', 'idstring']],
      ['service-name:patch:123', ['service-name', 'patch', 123]],
      ['service-name:update:123', ['service-name', 'update', 123]],
      ['service-name:remove:123', ['service-name', 'remove', 123]],
      ['service-name:patch:null', ['service-name', 'patch', null]],
      ['service-name:update:null', ['service-name', 'update', null]],
      ['service-name:remove:null', ['service-name', 'remove', null]],
    ])('parseJobName(%s)', (jobName, [serviceName, methodName, id]) => {
      const result = parseJobName(jobName)
      expect(result[0]).toBe(serviceName)
      expect(result[1]).toBe(methodName)
      expect(result[2]).toBe(id)
    })
  })

  it('checks allowed services', () => {
    const serviceNames = ['test']
    expect(parseJobName('test:patch:123', serviceNames)).toBeTruthy()
    expect(() => parseJobName('unknown:patch:123', serviceNames)).toThrow(
      'not found'
    )
  })

  describe('throws for bad job names', () => {
    test.each([
      ['', false],
      ['anything', false],
      ['thing.create', false],
      ['service-name:patch', false],
      ['service-name:update', false],
      ['service-name:remove', false],
      ['svc:bad-method', false],
      ['service-name:create:idstring', false],
      ['service-name:create:123', false],
      ['service-name:patch:123:toomanyparts', false],
      ['service-name:update:123:toomanyparts', false],
      ['service-name:remove:123:toomanyparts', false],
    ])('parseJobName(%s)', (name) => {
      expect(() => parseJobName(name)).toThrow('Invalid job name')
    })
  })
})
