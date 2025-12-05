const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Admin routes only
router.post('/', authenticate, authorize('admin'), createUser);
router.get('/', authenticate, authorize('admin'), getUsers);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;

