import { config } from "dotenv";
import { GoogleGenAI } from "@google/genai";

config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function checkQuota() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: "Reply with only OK",
    });

    console.log(" Gemini API is working!");
    console.log("Response:", response.text);

  } catch (error) {
    console.log("Gemini API Error:", error.message);
    console.log("Status:", error.status);
  }
}

checkQuota();