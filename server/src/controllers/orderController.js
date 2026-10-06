const { query, getClient } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const DELIVERY_FEE = 500;

const createOrder = async (req, res) => {
  const client = await getClient();
  try {
    const { items, delivery_address, delivery_name, delivery_phone, notes } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Order must contain at least one item.', 400);
    }

    await client.query('BEGIN');

    // Verify all menu items exist and are available, capture prices atomically
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuResult = await client.query(
        'SELECT id, name, price, is_available FROM menu_items WHERE id = $1',
        [item.menu_item_id]
      );

      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return sendError(res, `Menu item ID ${item.menu_item_id} not found.`, 404);
      }

      const menuItem = menuResult.rows[0];
      if (!menuItem.is_available) {
        await client.query('ROLLBACK');
        return sendError(res, `"${menuItem.name}" is currently unavailable.`, 400);
      }

      const qty = parseInt(item.quantity, 10);
      if (qty < 1) {
        await client.query('ROLLBACK');
        return sendError(res, 'Item quantity must be at least 1.', 400);
      }

      const itemSubtotal = parseFloat(menuItem.price) * qty;
      subtotal += itemSubtotal;
      orderItems.push({ menu_item_id: menuItem.id, quantity: qty, unit_price: menuItem.price, subtotal: itemSubtotal });
    }

    const delivery_fee = DELIVERY_FEE;
    const total = subtotal + delivery_fee;

    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (user_id, subtotal, delivery_fee, total, delivery_address, delivery_name, delivery_phone, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [userId, subtotal, delivery_fee, total, delivery_address, delivery_name || req.user.name, delivery_phone || req.user.phone, notes || null]);

    const order = orderResult.rows[0];

    // Create order items
    for (const oi of orderItems) {
      await client.query(`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `, [order.id, oi.menu_item_id, oi.quantity, oi.unit_price, oi.subtotal]);
    }

    await client.query('COMMIT');

    // Return full order
    const fullOrder = await getFullOrder(order.id);
    return sendSuccess(res, { order: fullOrder }, 201, 'Order placed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    return sendError(res, 'Failed to place order.', 500);
  } finally {
    client.release();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const result = await query(`
      SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'menu_item_name', m.name,
            'menu_item_image', m.image_url,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal
          )
        ) AS items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN menu_items m ON m.id = oi.menu_item_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    return sendSuccess(res, { orders: result.rows });
  } catch (err) {
    console.error('Get my orders error:', err);
    return sendError(res, 'Failed to fetch orders.', 500);
  }
};

const getMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getFullOrder(id);
    if (!order) return sendError(res, 'Order not found.', 404);
    if (order.user_id !== req.user.id) return sendError(res, 'Access denied.', 403);
    return sendSuccess(res, { order });
  } catch (err) {
    console.error('Get order error:', err);
    return sendError(res, 'Failed to fetch order.', 500);
  }
};

// Admin controllers
const adminGetAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email,
        COUNT(oi.id)::int AS item_count
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN order_items oi ON oi.order_id = o.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { sql += ` AND o.status = $1`; params.push(status); }
    sql += ' GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC';

    const result = await query(sql, params);
    return sendSuccess(res, { orders: result.rows });
  } catch (err) {
    console.error('Admin get orders error:', err);
    return sendError(res, 'Failed to fetch orders.', 500);
  }
};

const adminGetOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getFullOrder(id);
    if (!order) return sendError(res, 'Order not found.', 404);
    return sendSuccess(res, { order });
  } catch (err) {
    console.error('Admin get order error:', err);
    return sendError(res, 'Failed to fetch order.', 500);
  }
};

const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }
    const result = await query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) return sendError(res, 'Order not found.', 404);
    return sendSuccess(res, { order: result.rows[0] }, 200, 'Order status updated');
  } catch (err) {
    console.error('Update order status error:', err);
    return sendError(res, 'Failed to update order status.', 500);
  }
};

const adminGetStats = async (req, res) => {
  try {
    const [ordersResult, usersResult, menuResult, recentOrders, revenueResult] = await Promise.all([
      query('SELECT COUNT(*)::int AS total, status FROM orders GROUP BY status'),
      query('SELECT COUNT(*)::int AS total FROM users WHERE role = $1', ['user']),
      query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_available) ::int AS available FROM menu_items'),
      query(`
        SELECT o.id, o.status, o.total, o.created_at, u.name AS customer_name
        FROM orders o JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC LIMIT 10
      `),
      query(`SELECT COALESCE(SUM(total), 0)::numeric AS total_revenue FROM orders WHERE status != 'cancelled'`),
    ]);

    const statusCounts = {};
    ordersResult.rows.forEach(r => { statusCounts[r.status] = r.total; });
    const totalOrders = ordersResult.rows.reduce((a, r) => a + r.total, 0);

    return sendSuccess(res, {
      totalOrders,
      totalCustomers: usersResult.rows[0].total,
      totalMenuItems: menuResult.rows[0].total,
      availableMenuItems: menuResult.rows[0].available,
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
      ordersByStatus: statusCounts,
      recentOrders: recentOrders.rows,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return sendError(res, 'Failed to fetch stats.', 500);
  }
};

// Helper
const getFullOrder = async (orderId) => {
  const result = await query(`
    SELECT o.*,
      u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
      json_agg(
        json_build_object(
          'id', oi.id,
          'menu_item_id', oi.menu_item_id,
          'menu_item_name', m.name,
          'menu_item_image', m.image_url,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'subtotal', oi.subtotal
        ) ORDER BY oi.id
      ) AS items
    FROM orders o
    JOIN users u ON u.id = o.user_id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN menu_items m ON m.id = oi.menu_item_id
    WHERE o.id = $1
    GROUP BY o.id, u.name, u.email, u.phone
  `, [orderId]);
  return result.rows[0] || null;
};

module.exports = {
  createOrder, getMyOrders, getMyOrder,
  adminGetAllOrders, adminGetOrder, adminUpdateOrderStatus, adminGetStats,
};
