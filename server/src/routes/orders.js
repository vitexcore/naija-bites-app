const express = require('express');
const { body } = require('express-validator');
const {
  createOrder, getMyOrders, getMyOrder,
  adminGetAllOrders, adminGetOrder, adminUpdateOrderStatus, adminGetStats,
} = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Customer order routes
router.post('/', authenticate, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('delivery_address').trim().notEmpty().withMessage('Delivery address is required'),
  validate,
], createOrder);

router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getMyOrder);

// Admin order routes
router.get('/admin/all', authenticate, requireAdmin, adminGetAllOrders);
router.get('/admin/stats', authenticate, requireAdmin, adminGetStats);
router.get('/admin/:id', authenticate, requireAdmin, adminGetOrder);
router.patch('/admin/:id/status', authenticate, requireAdmin, [
  body('status').notEmpty().withMessage('Status is required'),
  validate,
], adminUpdateOrderStatus);

module.exports = router;
