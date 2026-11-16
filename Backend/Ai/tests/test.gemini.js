
import createGeminiClient from "../src/services/GeminiClient.js";

const ai = createGeminiClient();

async function testGemini() {
    const models = [
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash"
    ];

    for (const model of models) {
        try {
            console.log(`Testing ${model}...`);

            const response = await ai.models.generateContent({
                model,
                contents: "Reply with exactly: API WORKING"
            });

            console.log("SUCCESS:", model, response.text);

        } catch (error) {
            console.log("FAILED:", model, {
                status: error.status,
                message: error.message
            });
        }
    }
}

testGemini();
