const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const getAllCategories = async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, COUNT(m.id)::int AS item_count
      FROM categories c
      LEFT JOIN menu_items m ON m.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `);
    return sendSuccess(res, { categories: result.rows });
  } catch (err) {
    console.error('Get categories error:', err);
    return sendError(res, 'Failed to fetch categories.', 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    const result = await query(
      `INSERT INTO categories (name, description, image_url)
       VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), description || null, image_url || null]
    );
    return sendSuccess(res, { category: result.rows[0] }, 201, 'Category created');
  } catch (err) {
    console.error('Create category error:', err);
    if (err.code === '23505') {
      return sendError(res, 'A category with this name already exists.', 409);
    }
    return sendError(res, 'Failed to create category.', 500);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;
    const result = await query(
      `UPDATE categories SET name = COALESCE($1, name),
       description = COALESCE($2, description),
       image_url = COALESCE($3, image_url)
       WHERE id = $4 RETURNING *`,
      [name, description, image_url, id]
    );
    if (result.rows.length === 0) {
      return sendError(res, 'Category not found.', 404);
    }
    return sendSuccess(res, { category: result.rows[0] }, 200, 'Category updated');
  } catch (err) {
    console.error('Update category error:', err);
    return sendError(res, 'Failed to update category.', 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Category not found.', 404);
    }
    return sendSuccess(res, null, 200, 'Category deleted');
  } catch (err) {
    console.error('Delete category error:', err);
    if (err.code === '23503') {
      return sendError(res, 'Cannot delete — this category has existing menu items.', 409);
    }
    return sendError(res, 'Failed to delete category.', 500);
  }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
