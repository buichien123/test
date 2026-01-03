const pool = require("../config/database");
const crypto = require("crypto");

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 200);
};

// Ensure unique slug
const ensureUniqueSlug = async (slug, excludeId = null) => {
  let finalSlug = slug;
  let counter = 1;

  while (true) {
    let query = "SELECT id FROM blog_posts WHERE slug = ?";
    const params = [finalSlug];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [posts] = await pool.execute(query, params);

    if (posts.length === 0) {
      return finalSlug;
    }

    finalSlug = `${slug}-${counter}`;
    counter++;
  }
};

// Get all blog posts with pagination and filters
const getBlogPosts = async (filters = {}) => {
  const {
    page = 1,
    limit = 12,
    status = "published",
    search = "",
    category_id = null,
    author_id = null,
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = "1=1";
  const params = [];

  if (status) {
    whereClause += " AND bp.status = ?";
    params.push(status);
  }

  if (search && search.trim()) {
    whereClause +=
      " AND (bp.title LIKE ? OR bp.excerpt LIKE ? OR bp.content LIKE ?)";
    const searchPattern = `%${search.trim()}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (category_id) {
    whereClause +=
      " AND EXISTS (SELECT 1 FROM blog_post_categories bpc WHERE bpc.post_id = bp.id AND bpc.category_id = ?)";
    params.push(category_id);
  }

  if (author_id) {
    whereClause += " AND bp.author_id = ?";
    params.push(author_id);
  }

  // Convert to integers
  let limitInt = parseInt(limit, 10);
  let offsetInt = parseInt(offset, 10);

  if (isNaN(limitInt) || limitInt < 1) {
    limitInt = 12;
  }
  if (isNaN(offsetInt) || offsetInt < 0) {
    offsetInt = 0;
  }

  // Get total count
  const [countResult] = await pool.execute(
    `SELECT COUNT(DISTINCT bp.id) as total
     FROM blog_posts bp
     WHERE ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  // Get posts
  const [posts] = await pool.execute(
    `SELECT 
      bp.*,
      u.username as author_username,
      u.full_name as author_name,
      u.email as author_email,
      (SELECT COUNT(*) FROM blog_comments bc WHERE bc.post_id = bp.id AND bc.status = 'approved') as comment_count
     FROM blog_posts bp
     LEFT JOIN users u ON bp.author_id = u.id
     WHERE ${whereClause}
     ORDER BY bp.published_at DESC, bp.created_at DESC
     LIMIT ${limitInt} OFFSET ${offsetInt}`,
    params
  );

  // Get categories for each post
  for (const post of posts) {
    const [categories] = await pool.execute(
      `SELECT bc.id, bc.name, bc.slug
       FROM blog_categories bc
       INNER JOIN blog_post_categories bpc ON bc.id = bpc.category_id
       WHERE bpc.post_id = ?`,
      [post.id]
    );
    post.categories = categories;
  }

  return {
    posts,
    pagination: {
      page: parseInt(page),
      limit: limitInt,
      total,
      totalPages: Math.ceil(total / limitInt),
    },
  };
};

// Get blog post by ID or slug
const getBlogPostById = async (identifier, includeComments = true) => {
  const isNumeric = /^\d+$/.test(identifier);
  const query = isNumeric
    ? "SELECT bp.*, u.username as author_username, u.full_name as author_name, u.email as author_email FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id WHERE bp.id = ?"
    : "SELECT bp.*, u.username as author_username, u.full_name as author_name, u.email as author_email FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id WHERE bp.slug = ?";

  const [posts] = await pool.execute(query, [identifier]);

  if (posts.length === 0) {
    throw new Error("Không tìm thấy bài viết");
  }

  const post = posts[0];

  // Get categories
  const [categories] = await pool.execute(
    `SELECT bc.id, bc.name, bc.slug
     FROM blog_categories bc
     INNER JOIN blog_post_categories bpc ON bc.id = bpc.category_id
     WHERE bpc.post_id = ?`,
    [post.id]
  );
  post.categories = categories;

  // Get comments if requested
  if (includeComments) {
    const [comments] = await pool.execute(
      `SELECT 
        bc.*,
        u.username as user_username,
        u.full_name as user_name,
        u.email as user_email
       FROM blog_comments bc
       LEFT JOIN users u ON bc.user_id = u.id
       WHERE bc.post_id = ? AND bc.status = 'approved'
       ORDER BY bc.created_at ASC`,
      [post.id]
    );

    // Organize comments into tree structure
    const commentMap = new Map();
    const rootComments = [];

    comments.forEach((comment) => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    comments.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    post.comments = rootComments;
    post.comment_count = comments.length;
  }

  // Increment views
  await pool.execute("UPDATE blog_posts SET views = views + 1 WHERE id = ?", [
    post.id,
  ]);
  post.views = (post.views || 0) + 1;

  return post;
};

// Create blog post
const createBlogPost = async (postData) => {
  const {
    title,
    excerpt,
    content,
    featured_image,
    author_id,
    status = "draft",
    meta_title,
    meta_description,
    category_ids = [],
    published_at = null,
  } = postData;

  if (!title || !content || !author_id) {
    throw new Error("Tiêu đề, nội dung và tác giả là bắt buộc");
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Generate slug
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    // Set published_at if status is published
    let finalPublishedAt = published_at;
    if (status === "published" && !finalPublishedAt) {
      finalPublishedAt = new Date();
    }

    // Insert post
    const [result] = await connection.execute(
      `INSERT INTO blog_posts 
       (title, slug, excerpt, content, featured_image, author_id, status, meta_title, meta_description, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        excerpt || null,
        content,
        featured_image || null,
        author_id,
        status,
        meta_title || null,
        meta_description || null,
        finalPublishedAt,
      ]
    );

    const postId = result.insertId;

    // Add categories
    if (category_ids && category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await connection.execute(
          "INSERT INTO blog_post_categories (post_id, category_id) VALUES (?, ?)",
          [postId, categoryId]
        );
      }
    }

    await connection.commit();

    // Return created post
    return await getBlogPostById(postId, false);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Update blog post
const updateBlogPost = async (postId, postData) => {
  const {
    title,
    excerpt,
    content,
    featured_image,
    status,
    meta_title,
    meta_description,
    category_ids,
    published_at,
  } = postData;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if post exists
    const [existing] = await connection.execute(
      "SELECT id, title, slug FROM blog_posts WHERE id = ?",
      [postId]
    );
    if (existing.length === 0) {
      throw new Error("Không tìm thấy bài viết");
    }

    // Update slug if title changed
    let slug = existing[0].slug;
    if (title && title !== existing[0].title) {
      const baseSlug = generateSlug(title);
      slug = await ensureUniqueSlug(baseSlug, postId);
    }

    // Handle published_at
    let finalPublishedAt = published_at;
    if (status === "published" && !finalPublishedAt) {
      const [current] = await connection.execute(
        "SELECT published_at FROM blog_posts WHERE id = ?",
        [postId]
      );
      if (!current[0].published_at) {
        finalPublishedAt = new Date();
      } else {
        finalPublishedAt = current[0].published_at;
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (title) {
      updates.push("title = ?");
      params.push(title);
    }
    if (slug) {
      updates.push("slug = ?");
      params.push(slug);
    }
    if (excerpt !== undefined) {
      updates.push("excerpt = ?");
      params.push(excerpt);
    }
    if (content) {
      updates.push("content = ?");
      params.push(content);
    }
    if (featured_image !== undefined) {
      updates.push("featured_image = ?");
      params.push(featured_image);
    }
    if (status) {
      updates.push("status = ?");
      params.push(status);
    }
    if (meta_title !== undefined) {
      updates.push("meta_title = ?");
      params.push(meta_title);
    }
    if (meta_description !== undefined) {
      updates.push("meta_description = ?");
      params.push(meta_description);
    }
    if (finalPublishedAt !== undefined) {
      updates.push("published_at = ?");
      params.push(finalPublishedAt);
    }

    if (updates.length > 0) {
      params.push(postId);
      await connection.execute(
        `UPDATE blog_posts SET ${updates.join(", ")} WHERE id = ?`,
        params
      );
    }

    // Update categories
    if (category_ids !== undefined) {
      // Remove existing categories
      await connection.execute(
        "DELETE FROM blog_post_categories WHERE post_id = ?",
        [postId]
      );

      // Add new categories
      if (category_ids && category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await connection.execute(
            "INSERT INTO blog_post_categories (post_id, category_id) VALUES (?, ?)",
            [postId, categoryId]
          );
        }
      }
    }

    await connection.commit();

    // Return updated post
    return await getBlogPostById(postId, false);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Delete blog post
const deleteBlogPost = async (postId) => {
  const [result] = await pool.execute("DELETE FROM blog_posts WHERE id = ?", [
    postId,
  ]);

  if (result.affectedRows === 0) {
    throw new Error("Không tìm thấy bài viết");
  }

  return { success: true };
};

// Create comment
const createComment = async (commentData) => {
  const { post_id, user_id, parent_id, name, email, content } = commentData;

  if (!post_id) {
    throw new Error("ID bài viết là bắt buộc");
  }

  if (!content || !content.trim()) {
    throw new Error("Nội dung bình luận là bắt buộc");
  }

  // Check if post exists
  const [posts] = await pool.execute("SELECT id FROM blog_posts WHERE id = ?", [
    post_id,
  ]);
  if (posts.length === 0) {
    throw new Error("Không tìm thấy bài viết");
  }

  // Ensure name is always provided
  // If user is logged in but name is missing, use a default
  // If guest user, name is required
  if (!user_id && !name) {
    throw new Error("Vui lòng nhập tên");
  }

  // If user is logged in but name is still null/empty, use default
  if (user_id && !name) {
    name = "Người dùng";
  }

  // Ensure name is not empty string
  if (!name || !name.trim()) {
    throw new Error("Vui lòng nhập tên");
  }

  // Determine status: if user is admin, auto-approve; otherwise pending
  let status = "pending";
  if (user_id) {
    // Check if user is admin
    const [users] = await pool.execute("SELECT role FROM users WHERE id = ?", [
      user_id,
    ]);
    if (users.length > 0 && users[0].role === "admin") {
      status = "approved";
    }
  }

  const [result] = await pool.execute(
    `INSERT INTO blog_comments (post_id, user_id, parent_id, name, email, content, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      post_id,
      user_id || null,
      parent_id || null,
      name.trim(),
      email || null,
      content.trim(),
      status,
    ]
  );

  return await getCommentById(result.insertId);
};

// Get comment by ID
const getCommentById = async (commentId) => {
  const [comments] = await pool.execute(
    `SELECT bc.*, u.username as user_username, u.full_name as user_name
     FROM blog_comments bc
     LEFT JOIN users u ON bc.user_id = u.id
     WHERE bc.id = ?`,
    [commentId]
  );

  if (comments.length === 0) {
    throw new Error("Không tìm thấy bình luận");
  }

  return comments[0];
};

// Get comments for a post
const getPostComments = async (postId, status = "approved") => {
  const [comments] = await pool.execute(
    `SELECT 
      bc.*,
      u.username as user_username,
      u.full_name as user_name,
      u.email as user_email
     FROM blog_comments bc
     LEFT JOIN users u ON bc.user_id = u.id
     WHERE bc.post_id = ? AND bc.status = ?
     ORDER BY bc.created_at ASC`,
    [postId, status]
  );

  // Organize into tree
  const commentMap = new Map();
  const rootComments = [];

  comments.forEach((comment) => {
    comment.replies = [];
    commentMap.set(comment.id, comment);
  });

  comments.forEach((comment) => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
};

// Update comment status (admin only)
const updateCommentStatus = async (commentId, status) => {
  const validStatuses = ["pending", "approved", "rejected", "spam"];
  if (!validStatuses.includes(status)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  const [result] = await pool.execute(
    "UPDATE blog_comments SET status = ? WHERE id = ?",
    [status, commentId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Không tìm thấy bình luận");
  }

  return await getCommentById(commentId);
};

// Delete comment
const deleteComment = async (commentId) => {
  const [result] = await pool.execute(
    "DELETE FROM blog_comments WHERE id = ?",
    [commentId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Không tìm thấy bình luận");
  }

  return { success: true };
};

// Get blog categories
const getBlogCategories = async () => {
  const [categories] = await pool.execute(
    "SELECT bc.*, COUNT(bpc.post_id) as post_count FROM blog_categories bc LEFT JOIN blog_post_categories bpc ON bc.id = bpc.category_id GROUP BY bc.id ORDER BY bc.name ASC"
  );
  return categories;
};

// Create blog category
const createBlogCategory = async (categoryData) => {
  const { name, description } = categoryData;

  if (!name) {
    throw new Error("Tên danh mục là bắt buộc");
  }

  const slug = generateSlug(name);
  const finalSlug = await ensureUniqueSlugForCategory(slug);

  const [result] = await pool.execute(
    "INSERT INTO blog_categories (name, slug, description) VALUES (?, ?, ?)",
    [name, finalSlug, description || null]
  );

  const [categories] = await pool.execute(
    "SELECT * FROM blog_categories WHERE id = ?",
    [result.insertId]
  );
  return categories[0];
};

// Update ensureUniqueSlug to work with different tables
const ensureUniqueSlugForCategory = async (slug, excludeId = null) => {
  let finalSlug = slug;
  let counter = 1;

  while (true) {
    let query = "SELECT id FROM blog_categories WHERE slug = ?";
    const params = [finalSlug];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [categories] = await pool.execute(query, params);

    if (categories.length === 0) {
      return finalSlug;
    }

    finalSlug = `${slug}-${counter}`;
    counter++;
  }
};

// Get all comments with filters (Admin)
const getAllComments = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    status = "",
    post_id = null,
    search = "",
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = "1=1";
  const params = [];

  if (status) {
    whereClause += " AND bc.status = ?";
    params.push(status);
  }

  if (post_id) {
    whereClause += " AND bc.post_id = ?";
    params.push(post_id);
  }

  if (search && search.trim()) {
    whereClause += " AND (bc.content LIKE ? OR bc.name LIKE ?)";
    const searchPattern = `%${search.trim()}%`;
    params.push(searchPattern, searchPattern);
  }

  // Convert to integers
  let limitInt = parseInt(limit, 10);
  let offsetInt = parseInt(offset, 10);

  if (isNaN(limitInt) || limitInt < 1) {
    limitInt = 20;
  }
  if (isNaN(offsetInt) || offsetInt < 0) {
    offsetInt = 0;
  }

  // Get total count
  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total
     FROM blog_comments bc
     WHERE ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  // Get comments
  const [comments] = await pool.execute(
    `SELECT 
      bc.*,
      u.username as user_username,
      u.full_name as user_name,
      u.email as user_email,
      bp.title as post_title,
      bp.slug as post_slug
     FROM blog_comments bc
     LEFT JOIN users u ON bc.user_id = u.id
     LEFT JOIN blog_posts bp ON bc.post_id = bp.id
     WHERE ${whereClause}
     ORDER BY bc.created_at DESC
     LIMIT ${limitInt} OFFSET ${offsetInt}`,
    params
  );

  return {
    comments,
    pagination: {
      page: parseInt(page),
      limit: limitInt,
      total,
      totalPages: Math.ceil(total / limitInt),
    },
  };
};

module.exports = {
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createComment,
  getCommentById,
  getPostComments,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  getBlogCategories,
  createBlogCategory,
};
