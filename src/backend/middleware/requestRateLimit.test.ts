import request from 'supertest'
import App from '../app'
import IndexRoute from '../routes/IndexRoutes'

const indexRoute = new IndexRoute()
const app = new App([indexRoute])

describe('requestRateLimiter allows requests', () => {
  it('should respond with 200 when rate-limit not reached', async () => {
    await request(app.getServer()).get('/').expect(200)
  })
})

describe('requestRateLimiter denies requests', () => {
  it('should respond with 429 once 20 requests per minute rate-limit reached', async () => {
    for (let i = 1; i < 20; i++) {
      await request(app.getServer()).get('/').expect(200)
    }
    // rate-limit should now be hit
    await request(app.getServer()).get('/').expect(429)
  })
})
