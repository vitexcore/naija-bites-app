const express = require('express');
const { body } = require('express-validator');
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', getAllCategories);

router.post('/', authenticate, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  validate,
], createCategory);

router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

module.exports = router;
