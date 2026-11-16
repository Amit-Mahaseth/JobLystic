import amqp from 'amqplib'
import Config from '../config/config.js'

let connection, channel

/**
 * Establishes a connection to the RabbitMQ broker and opens an AMQP channel.
 *
 * @returns {Promise<void>}
 */
export async function ConnectToRabbitMQ() {
  connection = await amqp.connect(Config.RABBITMQ_URI)
  channel = await connection.createChannel()
  console.log('Connect to RabbitMQ')
}

/**
 * Publishes a JSON serializable message to a named durable RabbitMQ queue.
 *
 * @param {string} queueName - Name of the target queue.
 * @param {Object} message - Payload to publish to the queue.
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
 * Subscribes to messages on a durable RabbitMQ queue and invokes a callback with the parsed JSON payload.
 *
 * @param {string} queueName - Name of the queue to consume from.
 * @param {function(Object): Promise<void>|void} callback - Handler called when a message is received.
 * @returns {Promise<void>}
 */
export async function SubsCribeToQueue(queueName, callback) {
  if (!channel) {
    await ConnectToRabbitMQ()
  }
  channel.assertQueue(queueName, { durable: true })
  channel.consume(queueName, (msg) => {
    callback(JSON.parse(msg.content.toString()))
    channel.ack(msg)
  })
}