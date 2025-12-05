const pool = require('../config/database');

const getAllCategories = async (filters = {}) => {
  const { page = 1, limit = 20, search } = filters;
  
  // Validate and convert limit and offset to integers
  let limitInt = parseInt(limit, 10);
  let pageInt = parseInt(page, 10);
  
  if (isNaN(limitInt) || limitInt < 1) {
    limitInt = 20;
  }
  if (isNaN(pageInt) || pageInt < 1) {
    pageInt = 1;
  }
  
  const offsetInt = Math.max(0, (pageInt - 1) * limitInt);

  let query = 'SELECT * FROM categories WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ` ORDER BY name LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [categories] = await pool.execute(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM categories WHERE 1=1';
  const countParams = [];

  if (search) {
    countQuery += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    countParams.push(searchTerm, searchTerm);
  }

  const [countResult] = await pool.execute(countQuery, countParams);
  const total = countResult[0].total;

  return {
    categories,
    pagination: {
      page: pageInt,
      limit: limitInt,
      total,
      pages: Math.ceil(total / limitInt)
    }
  };
};

const getCategoryById = async (id) => {
  const [categories] = await pool.execute(
    'SELECT * FROM categories WHERE id = ?',
    [id]
  );

  if (categories.length === 0) {
    throw new Error('Không tìm thấy danh mục');
  }

  return categories[0];
};

const createCategory = async (categoryData) => {
  const { name, description, image_url } = categoryData;

  const [result] = await pool.execute(
    'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
    [name, description || null, image_url || null]
  );

  return await getCategoryById(result.insertId);
};

const updateCategory = async (id, categoryData) => {
  const { name, description, image_url } = categoryData;

  const [result] = await pool.execute(
    'UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?',
    [name, description, image_url, id]
  );

  if (result.affectedRows === 0) {
    throw new Error('Không tìm thấy danh mục');
  }

  return await getCategoryById(id);
};

const deleteCategory = async (id) => {
  const [result] = await pool.execute(
    'DELETE FROM categories WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    throw new Error('Không tìm thấy danh mục');
  }

  return { success: true };
};

const getCategoryWithProducts = async (id, page = 1, limit = 12) => {
  const offset = (page - 1) * limit;

  const category = await getCategoryById(id);

  // Convert and validate limit and offset
  let limitInt = parseInt(limit, 10);
  let offsetInt = parseInt(offset, 10);
  
  if (isNaN(limitInt) || limitInt < 1) {
    limitInt = 12;
  }
  if (isNaN(offsetInt) || offsetInt < 0) {
    offsetInt = 0;
  }

  // Use template literal for LIMIT/OFFSET after validation
  const [products] = await pool.execute(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.category_id = ? AND p.status = 'active'
     ORDER BY p.created_at DESC 
     LIMIT ${limitInt} OFFSET ${offsetInt}`,
    [id]
  );

  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND status = "active"',
    [id]
  );

  return {
    category,
    products,
    pagination: {
      page: parseInt(page),
      limit: limitInt,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limitInt)
    }
  };
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryWithProducts
};

