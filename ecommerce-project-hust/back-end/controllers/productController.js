const productService = require('../services/productService');

// Get all products
const getProducts = async (req, res) => {
  try {
    // Check if user is admin and wants to include inactive products
    const isAdmin = req.user?.role === 'admin';
    const includeInactive = isAdmin && req.query.include_inactive === 'true';
    
    const filters = {
      category_id: req.query.category_id,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 12,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      sort_by: req.query.sort_by || 'created_at',
      sort_order: req.query.sort_order || 'DESC',
      include_inactive: includeInactive
    };

    const result = await productService.getProducts(filters);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách sản phẩm'
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy thông tin sản phẩm'
    });
  }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const product = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo sản phẩm'
    });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    const product = await productService.updateProduct(id, productData);

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật sản phẩm'
    });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi xóa sản phẩm'
    });
  }
};

// Add related products
const addRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { related_product_ids } = req.body;

    if (!related_product_ids || !Array.isArray(related_product_ids)) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách sản phẩm liên quan không hợp lệ'
      });
    }

    await productService.addRelatedProducts(id, related_product_ids);

    res.json({
      success: true,
      message: 'Thêm sản phẩm liên quan thành công'
    });
  } catch (error) {
    console.error('Add related products error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addRelatedProducts
};
