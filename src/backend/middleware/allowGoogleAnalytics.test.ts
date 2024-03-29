import { allowGoogleAnalytics } from './allowGoogleAnalytics'
import { expect } from '@jest/globals'

const req: any = {
  cookies: {
    acceptAnalytics: 'true',
  },
}
const next: any = jest.fn()
const res: any = {
  headers: {},
  locals: {},
  cookie(name: any, value: any) {
    this.headers[name] = value
  },
}

describe('allowGoogleAnalytics', () => {
  it('Should return the correct object', () => {
    allowGoogleAnalytics(req, res, next)
    expect(res.locals).toEqual({
      allowGoogleAnalytics: true,
      GTM_ID: 'SOME_GTM_ID',
      GTM_AUTH: 'GTM_AUTH',
    })
  })
})
