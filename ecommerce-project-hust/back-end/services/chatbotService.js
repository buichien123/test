const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const pool = require("../config/database");

// Initialize AI clients (only if API key is valid, not placeholder)
const openai =
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== "your_openai_api_key_here" &&
  process.env.OPENAI_API_KEY.trim() !== ""
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    : null;

const genAI =
  process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ""
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// Get AI provider from env (default: gemini)
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini"; // 'gemini' or 'openai'

// Get product information for chatbot context
const getProductContext = async (searchQuery = null) => {
  try {
    let query =
      'SELECT id, name, description, price, stock, image_url FROM products WHERE status = "active"';
    const params = [];

    if (searchQuery) {
      query += " AND (name LIKE ? OR description LIKE ?)";
      const searchTerm = `%${searchQuery}%`;
      params.push(searchTerm, searchTerm);
    }

    query += " ORDER BY created_at DESC LIMIT 30";

    const [products] = await pool.execute(query, params);

    if (products.length === 0) {
      return "Hiện tại không có sản phẩm nào.";
    }

    return products
      .map((p) => {
        const stockStatus =
          p.stock > 0 ? `Còn ${p.stock} sản phẩm` : "Hết hàng";
        return `ID: ${p.id}, Tên: ${p.name}, Giá: ${parseInt(
          p.price
        ).toLocaleString("vi-VN")}đ, Tồn kho: ${stockStatus}`;
      })
      .join("\n");
  } catch (error) {
    console.error("Error getting product context:", error);
    return "";
  }
};

// Get product by ID
const getProductById = async (productId) => {
  try {
    const [products] = await pool.execute(
      'SELECT id, name, description, price, stock, image_url FROM products WHERE id = ? AND status = "active"',
      [productId]
    );

    if (products.length === 0) {
      return null;
    }

    return products[0];
  } catch (error) {
    console.error("Error getting product by ID:", error);
    return null;
  }
};

// Search products
const searchProducts = async (query) => {
  try {
    const [products] = await pool.execute(
      `SELECT id, name, description, price, stock, image_url 
       FROM products 
       WHERE status = 'active' AND (name LIKE ? OR description LIKE ?) 
       ORDER BY created_at DESC
       LIMIT 10`,
      [`%${query}%`, `%${query}%`]
    );

    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};

// Build system prompt
const buildSystemPrompt = (productContext) => {
  return `Bạn là trợ lý bán hàng thông minh và thân thiện của một website thương mại điện tử tên TechStore.

NHIỆM VỤ CỦA BẠN:
1. Cung cấp thông tin chi tiết về sản phẩm (tên, giá, mô tả, tồn kho)
2. Giúp khách hàng tìm kiếm sản phẩm theo nhu cầu
3. Kiểm tra tình trạng tồn kho của sản phẩm
4. Hướng dẫn quy trình mua hàng và thanh toán
5. Trả lời các câu hỏi về chính sách vận chuyển, đổi trả, bảo hành

DANH SÁCH SẢN PHẨM HIỆN CÓ:
${productContext}

HƯỚNG DẪN TRẢ LỜI:
- Khi khách hàng hỏi về sản phẩm: Cung cấp thông tin chi tiết từ danh sách trên, bao gồm ID, tên, giá, và tình trạng tồn kho
- QUAN TRỌNG: Khi đề cập đến bất kỳ sản phẩm nào, LUÔN LUÔN bao gồm ID sản phẩm theo format "(ID: X)" ngay sau tên sản phẩm. Ví dụ: "iPhone 15 Pro (ID: 1)" hoặc "**iPhone 15 Pro** (ID: 1)"
- Khi khách hàng muốn tìm sản phẩm: Gợi ý các sản phẩm phù hợp từ danh sách và luôn bao gồm ID cho mỗi sản phẩm
- Khi khách hàng hỏi về tồn kho: Kiểm tra và thông báo chính xác số lượng còn lại, kèm theo ID sản phẩm
- Khi khách hàng muốn mua hàng: Hướng dẫn thêm vào giỏ hàng và thanh toán
- Luôn trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp và nhiệt tình
- Nếu không tìm thấy sản phẩm, hãy gợi ý các sản phẩm tương tự hoặc đề nghị khách hàng tìm kiếm với từ khóa khác
- Khi khách hàng hỏi về giá, luôn hiển thị giá bằng định dạng VNĐ (ví dụ: 1.000.000đ)

CHÍNH SÁCH CỬA HÀNG:
- Miễn phí vận chuyển cho đơn hàng trên 500.000đ
- Bảo hành chính hãng cho tất cả sản phẩm
- Đổi trả dễ dàng trong vòng 7 ngày
- Nhiều chương trình ưu đãi đặc biệt`;
};

// Chat with Gemini Pro
const chatWithGemini = async (message, conversationHistory, productContext) => {
  if (!genAI) {
    throw new Error(
      "Gemini API key chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env"
    );
  }

  // Try different models in order of preference
  // Note: Model availability depends on API key permissions and region
  // Based on testing, gemini-2.5-flash is available and works well
  const modelsToTry = [
    "gemini-2.5-flash", // Confirmed available - fast and efficient (recommended)
    "gemini-2.0-flash", // Fallback option
    "gemini-1.5-flash", // Older flash model
    "gemini-1.5-pro", // Pro model
    "gemini-1.0-pro", // Version 1.0
    "gemini-pro", // Legacy model (may not be available)
  ];

  const systemPrompt = buildSystemPrompt(productContext);

  // Build full prompt with system instructions and conversation
  let fullPrompt = systemPrompt + "\n\n=== CUỘC HỘI THOẠI ===\n\n";

  // Add recent conversation history (last 6 messages for context)
  const recentHistory = conversationHistory.slice(-6);
  for (const msg of recentHistory) {
    fullPrompt += `${msg.role === "user" ? "Khách hàng" : "Trợ lý"}: ${
      msg.content
    }\n\n`;
  }

  fullPrompt += `Khách hàng: ${message}\n\nTrợ lý:`;

  // Try each model until one works
  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      console.log(`✅ Successfully used model: ${modelName}`);
      return response.text();
    } catch (error) {
      console.log(`⚠️ Model ${modelName} failed, trying next...`);
      lastError = error;
      continue;
    }
  }

  // If all models failed, provide helpful error message
  console.error("Gemini API error - all models failed:", lastError);

  const errorMessage = lastError?.message || "Unknown error";
  const is404Error =
    errorMessage.includes("404") || errorMessage.includes("not found");

  if (is404Error) {
    throw new Error(
      `Không tìm thấy model Gemini phù hợp. Có thể do:\n` +
        `1. API key không có quyền truy cập các model\n` +
        `2. Cần enable Generative AI API trong Google Cloud Console\n` +
        `3. Model names đã thay đổi. Vui lòng kiểm tra: https://ai.google.dev/api/models\n` +
        `\nChi tiết lỗi: ${errorMessage}`
    );
  } else {
    throw new Error(
      `Không thể kết nối với Gemini API. Vui lòng kiểm tra lại API key hoặc thử lại sau.\n` +
        `Chi tiết: ${errorMessage}`
    );
  }
};

// Chat with OpenAI (GPT-4o-mini or GPT-3.5-turbo)
const chatWithOpenAI = async (message, conversationHistory, productContext) => {
  if (!openai) {
    throw new Error("OpenAI API key chưa được cấu hình");
  }

  const systemPrompt = buildSystemPrompt(productContext);

  // Build conversation messages
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10).map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
    { role: "user", content: message },
  ];

  // Use GPT-4o-mini if available, fallback to GPT-3.5-turbo
  const model = "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model: model,
    messages: messages,
    temperature: 0.7,
    max_tokens: 800,
  });

  return completion.choices[0].message.content;
};

// Extract product IDs from text response
const extractProductIds = (text) => {
  // Match various patterns:
  // - "(ID: 1)" or "ID: 1"
  // - "ID 1" or "id 1"
  // - "(id: 1)"
  const idPatterns = [
    /\(?ID:\s*(\d+)\)?/gi, // "(ID: 1)" or "ID: 1"
    /\(?id:\s*(\d+)\)?/gi, // "(id: 1)" or "id: 1"
    /\(?ID\s+(\d+)\)?/gi, // "(ID 1)" or "ID 1"
    /\(?id\s+(\d+)\)?/gi, // "(id 1)" or "id 1"
  ];

  const productIds = new Set();

  idPatterns.forEach((pattern) => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach((match) => {
      const id = parseInt(match[1]);
      if (!isNaN(id) && id > 0) {
        productIds.add(id);
      }
    });
  });

  return Array.from(productIds);
};

// Get product details by IDs
const getProductsByIds = async (productIds) => {
  if (!productIds || productIds.length === 0) return [];

  try {
    const placeholders = productIds.map(() => "?").join(",");
    const [products] = await pool.execute(
      `SELECT id, name, price, stock, image_url, description 
       FROM products 
       WHERE id IN (${placeholders}) AND status = 'active'`,
      productIds
    );
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      price: parseInt(p.price),
      stock: p.stock,
      image_url: p.image_url,
      description: p.description,
    }));
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    return [];
  }
};

// Main chat function
const chat = async (message, conversationHistory = []) => {
  try {
    // Extract product search intent from message
    const lowerMessage = message.toLowerCase();
    let productContext = await getProductContext();

    // If user is asking about specific product, try to get more relevant products
    if (
      lowerMessage.includes("tìm") ||
      lowerMessage.includes("sản phẩm") ||
      lowerMessage.includes("mua")
    ) {
      // Try to extract search keywords
      const keywords = message
        .split(" ")
        .filter(
          (word) =>
            word.length > 2 &&
            ![
              "tìm",
              "sản",
              "phẩm",
              "mua",
              "bán",
              "có",
              "gì",
              "nào",
              "cho",
              "tôi",
              "bạn",
            ].includes(word.toLowerCase())
        );

      if (keywords.length > 0) {
        const searchQuery = keywords.join(" ");
        productContext = await getProductContext(searchQuery);
      }
    }

    let response;

    // Choose AI provider based on configuration
    if (AI_PROVIDER === "gemini") {
      if (!genAI) {
        throw new Error(
          "Gemini API key chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env"
        );
      }
      response = await chatWithGemini(
        message,
        conversationHistory,
        productContext
      );
    } else if (AI_PROVIDER === "openai") {
      if (!openai) {
        throw new Error(
          "OpenAI API key chưa được cấu hình. Vui lòng thêm OPENAI_API_KEY vào file .env"
        );
      }
      response = await chatWithOpenAI(
        message,
        conversationHistory,
        productContext
      );
    } else {
      // Fallback: try available provider (Gemini first, then OpenAI)
      if (genAI) {
        console.log("Using Gemini as fallback provider");
        response = await chatWithGemini(
          message,
          conversationHistory,
          productContext
        );
      } else if (openai) {
        console.log("Using OpenAI as fallback provider");
        response = await chatWithOpenAI(
          message,
          conversationHistory,
          productContext
        );
      } else {
        throw new Error(
          "Chưa cấu hình API key cho AI provider nào. Vui lòng thêm GEMINI_API_KEY hoặc OPENAI_API_KEY vào file .env"
        );
      }
    }

    // Extract product IDs from response
    const productIds = extractProductIds(response);
    const products =
      productIds.length > 0 ? await getProductsByIds(productIds) : [];

    return {
      text: response,
      products: products,
    };
  } catch (error) {
    console.error("Chatbot error:", error);
    throw error;
  }
};

module.exports = {
  chat,
  getProductContext,
  getProductById,
  searchProducts,
  getProductsByIds,
  extractProductIds,
};
