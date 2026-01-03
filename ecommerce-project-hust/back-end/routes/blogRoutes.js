const express = require('express');
const router = express.Router();
const {
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
  createBlogCategory
} = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/posts', getBlogPosts);
router.get('/posts/:id', getBlogPostById);
router.get('/categories', getBlogCategories);
router.get('/posts/:postId/comments', getPostComments);

// Comment routes (authenticated users can comment)
router.post('/posts/:postId/comments', authenticate, createComment);

// Admin routes
router.post('/posts', authenticate, authorize('admin'), createBlogPost);
router.put('/posts/:id', authenticate, authorize('admin'), updateBlogPost);
router.delete('/posts/:id', authenticate, authorize('admin'), deleteBlogPost);
router.get('/comments', authenticate, authorize('admin'), getAllComments);
router.put('/comments/:id/status', authenticate, authorize('admin'), updateCommentStatus);
router.delete('/comments/:id', authenticate, authorize('admin'), deleteComment);
router.post('/categories', authenticate, authorize('admin'), createBlogCategory);

module.exports = router;

