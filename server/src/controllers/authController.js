const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check for existing user
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, 'user', $4)
       RETURNING id, name, email, role, phone, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, phone || null]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, role: user.role });

    return sendSuccess(res, { user, token }, 201, 'Account created successfully');
  } catch (err) {
    console.error('Register error:', err);
    return sendError(res, 'Registration failed. Please try again.', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, name, email, password_hash, role, phone, address FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({ id: user.id, role: user.role });

    // Remove password_hash from response
    const { password_hash, ...safeUser } = user;

    return sendSuccess(res, { user: safeUser, token }, 200, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    return sendError(res, 'Login failed. Please try again.', 500);
  }
};

const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const result = await query(
      `UPDATE users SET name = $1, phone = $2, address = $3
       WHERE id = $4
       RETURNING id, name, email, role, phone, address, created_at`,
      [name || req.user.name, phone || req.user.phone, address || req.user.address, req.user.id]
    );
    return sendSuccess(res, { user: result.rows[0] }, 200, 'Profile updated');
  } catch (err) {
    console.error('Update profile error:', err);
    return sendError(res, 'Failed to update profile.', 500);
  }
};

module.exports = { register, login, getMe, updateProfile };
