const chatbotService = require("../services/chatbotService");

// Chatbot handler
const chat = async (req, res) => {
  try {
    const { message, conversation_history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tin nhắn",
      });
    }

    // Call chatbot service
    const botResponse = await chatbotService.chat(
      message.trim(),
      conversation_history
    );

    res.json({
      success: true,
      response: botResponse.text || botResponse, // Support both old and new format
      products: botResponse.products || [], // Include product data
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    // Fallback response if AI API fails
    res.json({
      success: true,
      response:
        "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ với chúng tôi qua email support@techstore.com.",
    });
  }
};

// Search products for chatbot
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập từ khóa tìm kiếm",
      });
    }

    const products = await chatbotService.searchProducts(query);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tìm kiếm sản phẩm",
    });
  }
};

// Get product stock
const getProductStock = async (req, res) => {
  try {
    const { product_id } = req.params;

    const product = await chatbotService.getProductById(product_id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        stock: product.stock,
      },
    });
  } catch (error) {
    console.error("Get product stock error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  chat,
  searchProducts,
  getProductStock,
};
