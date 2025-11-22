const pool = require("../config/database");

const getProducts = async (filters = {}) => {
  const {
    category_id,
    search,
    page = 1,
    limit = 12,
    min_price,
    max_price,
    sort_by = "created_at",
    sort_order = "DESC",
  } = filters;

  // Ensure limit and page are valid numbers
  let limitNum = Number.parseInt(limit, 10);
  let pageNum = Number.parseInt(page, 10);

  // Validate and set defaults
  if (isNaN(limitNum) || limitNum < 1) {
    limitNum = 12;
  }
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  const offsetNum = Math.max(0, (pageNum - 1) * limitNum);

  let query = `
    SELECT p.*, c.name as category_name,
    (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND status = 'approved') as avg_rating,
    (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND status = 'approved') as review_count
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE 1=1
  `;
  const params = [];

  // Only filter by active status if not admin (admin can see all)
  if (!filters.include_inactive) {
    query += " AND p.status = 'active'";
  }

  if (category_id) {
    query += " AND p.category_id = ?";
    params.push(Number.parseInt(category_id, 10));
  }

  if (search) {
    query += " AND (p.name LIKE ? OR p.description LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (min_price) {
    query += " AND p.price >= ?";
    params.push(Number.parseFloat(min_price));
  }

  if (max_price) {
    query += " AND p.price <= ?";
    params.push(Number.parseFloat(max_price));
  }

  // Validate sort_by to prevent SQL injection
  const allowedSortFields = ["created_at", "price", "name", "stock"];
  const sortField = allowedSortFields.includes(sort_by)
    ? sort_by
    : "created_at";
  const sortDir = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  // Use LIMIT and OFFSET - MySQL2 requires integers, not placeholders for LIMIT/OFFSET in some cases
  // So we'll use template literals for safety after validation
  query += ` ORDER BY p.${sortField} ${sortDir} LIMIT ${limitNum} OFFSET ${offsetNum}`;

  const [products] = await pool.execute(query, params);

  // Get total count
  let countQuery =
    'SELECT COUNT(*) as total FROM products WHERE status = "active"';
  const countParams = [];

  if (category_id) {
    countQuery += " AND category_id = ?";
    countParams.push(Number.parseInt(category_id, 10));
  }

  if (search) {
    countQuery += " AND (name LIKE ? OR description LIKE ?)";
    const searchTerm = `%${search}%`;
    countParams.push(searchTerm, searchTerm);
  }

  if (min_price) {
    countQuery += " AND price >= ?";
    countParams.push(Number.parseFloat(min_price));
  }

  if (max_price) {
    countQuery += " AND price <= ?";
    countParams.push(Number.parseFloat(max_price));
  }

  const [countResult] = await pool.execute(countQuery, countParams);
  const total = countResult[0].total;

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

const getProductById = async (id) => {
  const [products] = await pool.execute(
    `SELECT p.*, c.name as category_name,
     (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND status = 'approved') as avg_rating,
     (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND status = 'approved') as review_count
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ? AND p.status = 'active'`,
    [id]
  );

  if (products.length === 0) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  const product = products[0];

  // Get product images
  const [images] = await pool.execute(
    "SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order, id",
    [id]
  );
  product.images = images;

  // Get product variants
  const [variants] = await pool.execute(
    "SELECT * FROM product_variants WHERE product_id = ?",
    [id]
  );
  product.variants = variants;

  // Get related products
  const [relatedProducts] = await pool.execute(
    `SELECT p.*, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     INNER JOIN product_relations pr ON p.id = pr.related_product_id
     WHERE pr.product_id = ? AND p.status = 'active'
     LIMIT 8`,
    [id]
  );
  product.related_products = relatedProducts;

  // Get reviews
  const [reviews] = await pool.execute(
    `SELECT pr.*, u.username, u.full_name
     FROM product_reviews pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.product_id = ? AND pr.status = 'approved'
     ORDER BY pr.created_at DESC
     LIMIT 10`,
    [id]
  );
  product.reviews = reviews;

  return product;
};

const createProduct = async (productData) => {
  const {
    name,
    description,
    price,
    stock,
    image_url,
    category_id,
    images,
    variants,
  } = productData;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Create product
    const [result] = await connection.execute(
      "INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, price, stock, image_url || null, category_id || null]
    );

    const productId = result.insertId;

    // Add images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await connection.execute(
          "INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)",
          [productId, images[i].url, images[i].is_primary || i === 0, i]
        );
      }
    }

    // Add variants
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await connection.execute(
          "INSERT INTO product_variants (product_id, variant_type, variant_value, price_adjustment, stock, sku) VALUES (?, ?, ?, ?, ?, ?)",
          [
            productId,
            variant.type,
            variant.value,
            variant.price_adjustment || 0,
            variant.stock || 0,
            variant.sku || null,
          ]
        );
      }
    }

    await connection.commit();
    return await getProductById(productId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateProduct = async (id, productData) => {
  const { name, description, price, stock, image_url, category_id, status } =
    productData;

  const [result] = await pool.execute(
    "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category_id = ?, status = ? WHERE id = ?",
    [name, description, price, stock, image_url, category_id, status, id]
  );

  if (result.affectedRows === 0) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  return await getProductById(id);
};

const deleteProduct = async (id) => {
  const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [
    id,
  ]);

  if (result.affectedRows === 0) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  return { success: true };
};

const addRelatedProducts = async (productId, relatedProductIds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const relatedId of relatedProductIds) {
      if (relatedId !== productId) {
        await connection.execute(
          "INSERT IGNORE INTO product_relations (product_id, related_product_id) VALUES (?, ?)",
          [productId, relatedId]
        );
      }
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addRelatedProducts,
};
