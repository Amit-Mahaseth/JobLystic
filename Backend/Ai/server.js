/**
 * Server entrypoint for the AI Microservice.
 * Connects to MongoDB and starts Express HTTP server on port 3002.
 */
import app from './src/app.js'
import ConnenctToDB from './src/db/db.js'

try {
  await ConnenctToDB()
  app.listen(3002, () => {
    console.log('Ai Service is Running on Port 3002')
  })
} catch (error) {
  console.error('MongoDB connection failed:', error.message)
  process.exit(1)
}
