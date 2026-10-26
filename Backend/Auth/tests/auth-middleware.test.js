import {afterAll, beforeAll, expect, test} from '@jest/globals'
import {request, startServer, stopServer} from './helpers/auth-app.js'

beforeAll(startServer)
afterAll(stopServer)

test('GET /api/auth/getme returns 401 when no auth cookie is present', async () => {
  const response = await request('/api/auth/getme')
  const body = await response.json()

  expect(response.status).toBe(401)
  expect(body.msg).toBe('Unauthorized')
})
