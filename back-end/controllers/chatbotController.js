const OpenAI = require('openai');
const pool = require('../config/database');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get product information for chatbot context
const getProductContext = async () => {
  try {
    const [products] = await pool.execute(
      'SELECT id, name, description, price, stock FROM products WHERE status = "active" LIMIT 20'
    );
    return products.map(p => 
      `ID: ${p.id}, Tên: ${p.name}, Giá: ${p.price.toLocaleString('vi-VN')}đ, Tồn kho: ${p.stock}`
    ).join('\n');
  } catch (error) {
    console.error('Error getting product context:', error);
    return '';
  }
};

// Chatbot handler
const chat = async (req, res) => {
  try {
    const { message, conversation_history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn'
      });
    }

    // Get product context
    const productContext = await getProductContext();

    // Build system prompt
    const systemPrompt = `Bạn là trợ lý bán hàng thông minh của một website thương mại điện tử. 
Nhiệm vụ của bạn là:
1. Cung cấp thông tin về sản phẩm
2. Kiểm tra tình trạng hàng hóa (tồn kho)
3. Hướng dẫn quy trình mua hàng
4. Hỗ trợ đặt hàng

Danh sách sản phẩm hiện có:
${productContext}

Khi khách hàng hỏi về sản phẩm, hãy cung cấp thông tin chi tiết.
Khi khách hàng muốn đặt hàng, hãy hướng dẫn họ thêm vào giỏ hàng và thanh toán.
Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.`;

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const botResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      response: botResponse
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Fallback response if OpenAI API fails
    res.json({
      success: true,
      response: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ với chúng tôi qua email.'
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
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    const [products] = await pool.execute(
      `SELECT id, name, description, price, stock, image_url 
       FROM products 
       WHERE status = 'active' AND (name LIKE ? OR description LIKE ?) 
       LIMIT 10`,
      [`%${query}%`, `%${query}%`]
    );

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm kiếm sản phẩm'
    });
  }
};

// Get product stock
const getProductStock = async (req, res) => {
  try {
    const { product_id } = req.params;

    const [products] = await pool.execute(
      'SELECT id, name, stock FROM products WHERE id = ?',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({
      success: true,
      product: products[0]
    });
  } catch (error) {
    console.error('Get product stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  chat,
  searchProducts,
  getProductStock
};

