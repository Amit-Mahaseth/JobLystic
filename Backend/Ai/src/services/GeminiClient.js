import { GoogleGenAI } from "@google/genai"
import config from "../config/config.js"

export default function createGeminiClient() {
  return new GoogleGenAI({
    apiKey: config.GEMINI_API_KEY,
    httpOptions: {
      retryOptions: {
        attempts: 3,
        initialDelay: 1,
        maxDelay: 8,
        expBase: 2,
        jitter: 1,
        httpStatusCodes: [408, 429, 500, 502, 503, 504],
      },
      timeout: 120000,
    },
  })
}
