import dns from 'dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])

import app from './src/app.js'
import ConnectToDB from './src/db/db.js'
import { ConnectToRabbitMQ } from '../Notification/src/brokers/rabbitmq.js'

try {
  await ConnectToDB()
  await ConnectToRabbitMQ()
  
  app.listen(3000, () => {
    console.log('Auth Server is running on port 3000')
  })
} catch (error) {
  console.error('MongoDB connection failed:', error.message)
  process.exit(1)
}