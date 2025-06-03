const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, authorize } = require('../middleware/auth');
const { validateCategory } = require('../validators/categoryValidator');

// Публічні роути
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Захищені роути (потрібна авторизація)
router.post('/',
  auth,
  authorize('admin'),
  validateCategory,
  categoryController.createCategory
);

router.put('/:id',
  auth,
  authorize('admin'),
  validateCategory,
  categoryController.updateCategory
);

router.delete('/:id',
  auth,
  authorize('admin'),
  categoryController.deleteCategory
);

module.exports = router;