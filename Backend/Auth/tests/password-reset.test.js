import {afterAll, beforeAll, expect, jest, test} from '@jest/globals'
import {mocks, request, startServer, stopServer} from './helpers/auth-app.js'

beforeAll(startServer)
afterAll(stopServer)

test('POST /api/auth/forgot-password validates the email and sends a hashed OTP', async () => {
  const user = {
    email: 'person@example.com',
    save: jest.fn().mockResolvedValue(undefined)
  }
  mocks.findOne.mockClear()
  mocks.findOne.mockResolvedValue(user)
  mocks.hash.mockResolvedValue('hashed-otp')
  mocks.sendEmail.mockResolvedValue(undefined)

  const response = await request('/api/auth/forgot-password', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({email: user.email})
  })
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.msg).toBe('Otp Sent to email')
  expect(user.resetPasswordOTP).toBe('hashed-otp')
  expect(new Date(user.resetPasswordOTPExpires).getTime()).toBeGreaterThan(Date.now())
  expect(user.save).toHaveBeenCalled()
  expect(mocks.sendEmail).toHaveBeenCalledWith(
    user.email,
    'Reset Password',
    expect.stringMatching(/^Your OTP is \d{6}$/)
  )
})

test('POST /api/auth/verify-reset-otp rejects malformed OTPs', async () => {
  mocks.findOne.mockClear()
  const response = await request('/api/auth/verify-reset-otp', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({email: 'person@example.com', otp: '123'})
  })
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body.errors).toHaveLength(1)
  expect(mocks.findOne).not.toHaveBeenCalled()
})

test('POST /api/auth/reset-password requires a valid, unexpired OTP', async () => {
  const user = {
    email: 'person@example.com',
    resetPasswordOTP: 'hashed-otp',
    resetPasswordOTPExpires: new Date(Date.now() + 60_000),
    save: jest.fn().mockResolvedValue(undefined)
  }
  mocks.findOne.mockClear()
  mocks.findOne.mockResolvedValue(user)
  mocks.compare.mockResolvedValue(true)
  mocks.hash.mockResolvedValue('hashed-new-password')

  const response = await request('/api/auth/reset-password', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      email: user.email,
      otp: '123456',
      newpassword: 'new-password'
    })
  })
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.msg).toBe('Password Reset Successfully')
  expect(user.password).toBe('hashed-new-password')
  expect(user.resetPasswordOTP).toBeUndefined()
  expect(user.resetPasswordOTPExpires).toBeUndefined()
  expect(user.save).toHaveBeenCalled()
})
