import amqp from 'amqplib'
import Config from '../config/config.js'
let connection,channel

export async function ConnectToRabbitMQ(){
    connection=await amqp.connect(Config.RABBITMQ_URI)
    channel=await connection.createChannel()
    console.log('Connect to RabbitMQ')
}


export async function PublishToQueue(queueName,message) {

  if(!channel){
    await ConnectToRabbitMQ()
  }
  await channel.assertQueue(queueName,{durable:true})
  channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)))
}

export async function SubsCribeToQueue(queueName,callback) {

    if(!channel){
        await ConnectToRabbitMQ()
    }
channel.assertQueue(queueName,{durable:true})
channel.consume(queueName,(msg)=>{
    callback(JSON.parse(msg.content.toString()))
    channel.ack(msg)
})
  
}