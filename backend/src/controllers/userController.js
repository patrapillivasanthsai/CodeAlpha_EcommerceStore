const { query } = require('../config/db');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }

    if (email) {
      // Check if email taken by another user
      const existing = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase().trim(), userId]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email address is already in use.' });
      }
    }

    const updatedResult = await query(
      `UPDATE users
       SET name = $1, email = COALESCE($2, email)
       WHERE id = $3
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email ? email.toLowerCase().trim() : null, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
