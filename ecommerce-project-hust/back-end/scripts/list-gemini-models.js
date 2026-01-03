/**
 * Script to list available Gemini models
 * Run: node scripts/list-gemini-models.js
 */

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not found in .env file");
      process.exit(1);
    }

    console.log("🔍 Connecting to Gemini API...\n");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try to list models using the API
    // Note: The SDK doesn't have a direct listModels method, so we'll try common model names
    const commonModels = [
      "gemini-pro",
      "gemini-1.0-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
    ];

    console.log("📋 Testing available models:\n");

    const availableModels = [];

    for (const modelName of commonModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Try a simple test request
        const result = await model.generateContent("test");
        await result.response;
        availableModels.push(modelName);
        console.log(`✅ ${modelName} - Available`);
      } catch (error) {
        const errorMsg = error.message || "";
        if (errorMsg.includes("404") || errorMsg.includes("not found")) {
          console.log(`❌ ${modelName} - Not found`);
        } else if (
          errorMsg.includes("403") ||
          errorMsg.includes("permission")
        ) {
          console.log(`⚠️  ${modelName} - Permission denied`);
        } else {
          console.log(
            `⚠️  ${modelName} - Error: ${errorMsg.substring(0, 50)}...`
          );
        }
      }
    }

    console.log("\n📊 Summary:");
    if (availableModels.length > 0) {
      console.log(`✅ Found ${availableModels.length} available model(s):`);
      availableModels.forEach((model) => console.log(`   - ${model}`));
      console.log(
        "\n💡 Update your chatbotService.js to use one of these models."
      );
    } else {
      console.log("❌ No models found. Please check:");
      console.log("   1. API key is correct");
      console.log("   2. Generative AI API is enabled in Google Cloud Console");
      console.log("   3. API key has proper permissions");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

listModels();
