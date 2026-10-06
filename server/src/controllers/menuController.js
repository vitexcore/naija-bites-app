const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const getAllMenuItems = async (req, res) => {
  try {
    const { category, search, available } = req.query;

    let sql = `
      SELECT m.id, m.name, m.description, m.price, m.image_url, m.is_available,
             m.created_at, m.updated_at,
             c.id AS category_id, c.name AS category_name
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (category) {
      sql += ` AND c.id = $${idx++}`;
      params.push(parseInt(category, 10));
    }

    if (search) {
      sql += ` AND (m.name ILIKE $${idx} OR m.description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    if (available === 'true') {
      sql += ` AND m.is_available = TRUE`;
    }

    sql += ' ORDER BY c.name, m.name';

    const result = await query(sql, params);
    return sendSuccess(res, { items: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Get menu error:', err);
    return sendError(res, 'Failed to fetch menu items.', 500);
  }
};

const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT m.id, m.name, m.description, m.price, m.image_url, m.is_available,
             m.created_at, m.updated_at,
             c.id AS category_id, c.name AS category_name
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return sendError(res, 'Menu item not found.', 404);
    }
    return sendSuccess(res, { item: result.rows[0] });
  } catch (err) {
    console.error('Get menu item error:', err);
    return sendError(res, 'Failed to fetch menu item.', 500);
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, is_available } = req.body;
    const result = await query(`
      INSERT INTO menu_items (category_id, name, description, price, image_url, is_available)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [category_id, name, description, price, image_url || null, is_available !== undefined ? is_available : true]);

    // Fetch with category name
    const full = await query(`
      SELECT m.*, c.name AS category_name FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.id = $1
    `, [result.rows[0].id]);

    return sendSuccess(res, { item: full.rows[0] }, 201, 'Menu item created');
  } catch (err) {
    console.error('Create menu item error:', err);
    return sendError(res, 'Failed to create menu item.', 500);
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, image_url, is_available } = req.body;

    const existing = await query('SELECT id FROM menu_items WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return sendError(res, 'Menu item not found.', 404);
    }

    const result = await query(`
      UPDATE menu_items
      SET category_id = COALESCE($1, category_id),
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          price = COALESCE($4, price),
          image_url = COALESCE($5, image_url),
          is_available = COALESCE($6, is_available)
      WHERE id = $7
      RETURNING *
    `, [category_id, name, description, price, image_url, is_available, id]);

    const full = await query(`
      SELECT m.*, c.name AS category_name FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.id = $1
    `, [id]);

    return sendSuccess(res, { item: full.rows[0] }, 200, 'Menu item updated');
  } catch (err) {
    console.error('Update menu item error:', err);
    return sendError(res, 'Failed to update menu item.', 500);
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT id FROM menu_items WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return sendError(res, 'Menu item not found.', 404);
    }
    await query('DELETE FROM menu_items WHERE id = $1', [id]);
    return sendSuccess(res, null, 200, 'Menu item deleted');
  } catch (err) {
    console.error('Delete menu item error:', err);
    if (err.code === '23503') {
      return sendError(res, 'Cannot delete — this item exists in existing orders.', 409);
    }
    return sendError(res, 'Failed to delete menu item.', 500);
  }
};

module.exports = { getAllMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem };
