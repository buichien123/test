const categoryService = require('../services/categoryService');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      search: req.query.search
    };

    const result = await categoryService.getAllCategories(filters);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách danh mục'
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);

    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Get category with products
const getCategoryWithProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page || 1;
    const limit = req.query.limit || 12;

    const result = await categoryService.getCategoryWithProducts(id, page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get category with products error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Create category (Admin only)
const createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const category = await categoryService.createCategory(categoryData);

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo danh mục'
    });
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    const category = await categoryService.updateCategory(id, categoryData);

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật danh mục'
    });
  }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);

    res.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi server khi xóa danh mục'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryWithProducts,
  createCategory,
  updateCategory,
  deleteCategory
};

