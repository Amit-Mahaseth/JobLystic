import config from '../config/config.js'
import amqp from 'amqplib'

let connection, channel;

/**
 * Establishes a connection to the RabbitMQ broker and initializes a channel for the Notification service.
 *
 * @returns {Promise<void>}
 */
export async function ConnectToRabbitMQ() {
  connection = await amqp.connect(config.RABBITMQ_URI)
  channel = await connection.createChannel()
  console.log('Connected To RabbitMQ')
}

/**
 * Publishes a serialized JSON message to a durable queue.
 *
 * @param {string} queueName - Target queue name.
 * @param {Object} message - Object payload to serialize and publish.
 * @returns {Promise<void>}
 */
export async function PublishToQueue(queueName, message) {
  if (!channel) {
    await ConnectToRabbitMQ()
  }
  await channel.assertQueue(queueName, { durable: true })
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)))
}

/**
 * Consumes messages from a durable RabbitMQ queue, parses JSON payloads, and automatically acknowledges delivery.
 *
 * @param {string} queueName - Name of the queue to subscribe to.
 * @param {function(Object): Promise<void>|void} callback - Event listener invoked with deserialized payload.
 * @returns {Promise<void>}
 */
export async function SubscribeToQueue(queueName, callback) {
  if (!channel) {
    await ConnectToRabbitMQ()
  }
  await channel.assertQueue(queueName, { durable: true })
  channel.consume(queueName, async (msg) => {
    if (!msg) return

    try {
      await callback(JSON.parse(msg.content.toString()))
      channel.ack(msg)
    } catch (error) {
      console.error(`Failed to process ${queueName} message:`, error)
    }
  })
}