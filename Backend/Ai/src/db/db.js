import mongoose from "mongoose";
import config from '../config/config.js';

/**
 * Connects the AI microservice to the MongoDB database using the configured URI.
 *
 * @returns {Promise<void>} Resolves when connection succeeds or logs an error.
 */
export default async function ConnenctToDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Mongo Db Server Connected");
  } catch (err) {
    console.error("Mongo Db Server Error", err);
    throw err;
  }
}
