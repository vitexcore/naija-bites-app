const express = require('express');
const { body } = require('express-validator');
const { getAllMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', getAllMenuItems);
router.get('/:id', getMenuItem);

router.post('/', authenticate, requireAdmin, [
  body('category_id').isInt({ min: 1 }).withMessage('Valid category is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  validate,
], createMenuItem);

router.put('/:id', authenticate, requireAdmin, updateMenuItem);
router.delete('/:id', authenticate, requireAdmin, deleteMenuItem);

module.exports = router;
