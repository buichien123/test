const blogService = require("../services/blogService");

// Get all blog posts
const getBlogPosts = async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 12,
      status: req.query.status || "published",
      search: req.query.search || "",
      category_id: req.query.category_id || null,
      author_id: req.query.author_id || null,
    };

    const result = await blogService.getBlogPosts(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get blog posts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy danh sách bài viết",
    });
  }
};

// Get blog post by ID or slug
const getBlogPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const includeComments = req.query.include_comments !== "false";

    const post = await blogService.getBlogPostById(id, includeComments);

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Get blog post error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Lỗi server khi lấy bài viết",
    });
  }
};

// Create blog post (Admin only)
const createBlogPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author_id: req.user.userId,
    };

    const post = await blogService.createBlogPost(postData);

    res.status(201).json({
      success: true,
      message: "Tạo bài viết thành công",
      post,
    });
  } catch (error) {
    console.error("Create blog post error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server khi tạo bài viết",
    });
  }
};

// Update blog post (Admin only)
const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await blogService.updateBlogPost(id, req.body);

    res.json({
      success: true,
      message: "Cập nhật bài viết thành công",
      post,
    });
  } catch (error) {
    console.error("Update blog post error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server khi cập nhật bài viết",
    });
  }
};

// Delete blog post (Admin only)
const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    await blogService.deleteBlogPost(id);

    res.json({
      success: true,
      message: "Xóa bài viết thành công",
    });
  } catch (error) {
    console.error("Delete blog post error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server khi xóa bài viết",
    });
  }
};

// Create comment
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "ID bài viết là bắt buộc",
      });
    }

    // Determine name: if user is logged in, use their info; otherwise use body
    let name = null;
    if (req.user) {
      // User is logged in - use their full_name, username, or fallback
      name = req.user.full_name || req.user.username || "Người dùng";
    } else {
      // Guest user - use name from body
      name = req.body.name;
    }

    const commentData = {
      ...req.body,
      post_id: parseInt(postId),
      user_id: req.user ? req.user.userId : null,
      name: name,
      email: req.user ? req.user.email : req.body.email,
    };

    const comment = await blogService.createComment(commentData);

    // Determine message based on comment status
    const message =
      comment.status === "approved"
        ? "Bình luận của bạn đã được đăng thành công"
        : "Bình luận của bạn đã được gửi và đang chờ duyệt";

    res.status(201).json({
      success: true,
      message,
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server khi tạo bình luận",
    });
  }
};

// Get comments for a post
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const status = req.query.status || "approved";

    const comments = await blogService.getPostComments(postId, status);

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy bình luận",
    });
  }
};

// Get all comments (Admin)
const getAllComments = async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      status: req.query.status || "",
      post_id: req.query.post_id || null,
      search: req.query.search || "",
    };

    const result = await blogService.getAllComments(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get all comments error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy bình luận",
    });
  }
};

// Update comment status (Admin only)
const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp trạng thái",
      });
    }

    const comment = await blogService.updateCommentStatus(id, status);

    res.json({
      success: true,
      message: "Cập nhật trạng thái bình luận thành công",
      comment,
    });
  } catch (error) {
    console.error("Update comment status error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server khi cập nhật trạng thái",
    });
  }
};

// Delete comment (Admin only)
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await blogService.deleteComment(id);

    res.json({
      success: true,
      message: "Xóa bình luận thành công",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server khi xóa bình luận",
    });
  }
};

// Get blog categories
const getBlogCategories = async (req, res) => {
  try {
    const categories = await blogService.getBlogCategories();

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get blog categories error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy danh mục",
    });
  }
};

// Create blog category (Admin only)
const createBlogCategory = async (req, res) => {
  try {
    const category = await blogService.createBlogCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      category,
    });
  } catch (error) {
    console.error("Create blog category error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi server khi tạo danh mục",
    });
  }
};

module.exports = {
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createComment,
  getPostComments,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  getBlogCategories,
  createBlogCategory,
};
