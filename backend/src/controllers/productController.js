const { query } = require('../config/db');

// @desc    Get all products with search, category filter, and sorting
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res, next) => {
  try {
    const { category, search, sort, minPrice, maxPrice } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      sql += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length} OR category ILIKE $${params.length})`;
    }

    if (minPrice && !isNaN(parseFloat(minPrice))) {
      params.push(parseFloat(minPrice));
      sql += ` AND price >= $${params.length}`;
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      params.push(parseFloat(maxPrice));
      sql += ` AND price <= $${params.length}`;
    }

    if (sort === 'price-low') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'name-asc') {
      sql += ' ORDER BY name ASC';
    } else if (sort === 'name-desc') {
      sql += ' ORDER BY name DESC';
    } else if (sort === 'rating') {
      sql += ' ORDER BY rating DESC';
    } else {
      sql += ' ORDER BY id ASC';
    }

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const result = await query('SELECT DISTINCT category FROM products ORDER BY category ASC');
    const categories = result.rows.map((row) => row.category);

    return res.status(200).json({
      success: true,
      categories: ['All', ...categories],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getCategories,
};
