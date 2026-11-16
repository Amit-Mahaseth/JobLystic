import assert from "node:assert/strict"
import { mock, test } from "node:test"

let consumer
let acknowledged = 0

const channel = {
  assertQueue: async () => {},
  consume: (_queue, callback) => {
    consumer = callback
  },
  ack: () => {
    acknowledged += 1
  },
}

mock.module("../src/config/config.js", {
  exports: { default: { RABBITMQ_URI: "amqp://localhost" } },
})
mock.module("amqplib", {
  exports: {
    default: {
    connect: async () => ({
      createChannel: async () => channel,
    }),
    },
  },
})

const { SubscribeToQueue } = await import("../src/brokers/rabbitmq.js")

test("RabbitMQ acknowledges successful messages only after processing", async () => {
  await SubscribeToQueue("test", async (message) => {
    assert.deepEqual(message, { value: 1 })
  })

  await consumer({ content: Buffer.from('{"value":1}') })
  assert.equal(acknowledged, 1)
})

test("RabbitMQ leaves failed messages unacknowledged for recovery", async () => {
  const originalError = console.error
  console.error = () => {}
  try {
    await SubscribeToQueue("test", async () => {
      throw new Error("processing failed")
    })
    await consumer({ content: Buffer.from('{"value":2}') })
    assert.equal(acknowledged, 1)
  } finally {
    console.error = originalError
    mock.restoreAll()
  }
})
