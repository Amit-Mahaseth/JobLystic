import assert from "node:assert/strict"
import { mock, test } from "node:test"

const callbacks = new Map()
const sentEmails = []

mock.module("../src/brokers/rabbitmq.js", {
  exports: {
    SubscribeToQueue: async (queue, callback) => callbacks.set(queue, callback),
  },
})
mock.module("../src/utils/email.js", {
  exports: {
    default: async (...args) => sentEmails.push(args),
  },
})

const { default: StartListener } = await import("../src/brokers/listener.js")

test("notification listener subscribes to registration and login events", async () => {
  await StartListener()
  assert.deepEqual([...callbacks.keys()], ["user_registered", "user_logged_in"])
})

test("notification callbacks prepare emails for the event recipient", async () => {
  await StartListener()
  const user = {
    email: "person@example.com",
    Fullname: { firstname: "Test", lastname: "Person" },
  }

  await callbacks.get("user_registered")(user)
  await callbacks.get("user_logged_in")(user)

  assert.equal(sentEmails.length, 2)
  assert.equal(sentEmails[0][0], user.email)
  assert.equal(sentEmails[0][1], "Welcome to Our Service")
  assert.match(sentEmails[0][3], /Test Person/)
  assert.equal(sentEmails[1][0], user.email)
  assert.equal(sentEmails[1][1], "Login Notification")
  assert.match(sentEmails[1][3], /person@example\.com/)
})
