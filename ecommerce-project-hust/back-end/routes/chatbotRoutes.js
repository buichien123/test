const express = require('express');
const router = express.Router();
const { chat, searchProducts, getProductStock } = require('../controllers/chatbotController');

router.post('/chat', chat);
router.get('/search', searchProducts);
router.get('/product/:product_id/stock', getProductStock);

module.exports = router;

