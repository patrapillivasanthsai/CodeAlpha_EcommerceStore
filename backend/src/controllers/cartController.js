const { query } = require('../config/db');

// Helper to ensure user has a cart record
const getOrCreateCartId = async (userId) => {
  let cartResult = await query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (cartResult.rows.length === 0) {
    cartResult = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
  }
  return cartResult.rows[0].id;
};

// @desc    Get current user's shopping cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCartId(userId);

    const itemsResult = await query(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.category, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.id ASC`,
      [cartId]
    );

    const items = itemsResult.rows.map((row) => ({
      cartItemId: row.cart_item_id,
      productId: row.product_id,
      name: row.name,
      price: parseFloat(row.price),
      imageUrl: row.image_url,
      category: row.category,
      stockQuantity: row.stock_quantity,
      quantity: row.quantity,
      itemTotal: parseFloat((row.price * row.quantity).toFixed(2)),
    }));

    const subtotal = items.reduce((acc, item) => acc + item.itemTotal, 0);

    return res.status(200).json({
      success: true,
      cart: {
        cartId,
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
    }

    // Check if product exists and check stock
    const productResult = await query('SELECT id, name, price, stock_quantity FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = productResult.rows[0];

    const cartId = await getOrCreateCartId(userId);

    // Check existing item in cart
    const existingItemResult = await query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    let newQuantity = qty;
    if (existingItemResult.rows.length > 0) {
      newQuantity += existingItemResult.rows[0].quantity;
    }

    // Validate inventory stock limit
    if (newQuantity > product.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock_quantity} units of "${product.name}" are currently in stock.`,
      });
    }

    if (existingItemResult.rows.length > 0) {
      await query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [
        newQuantity,
        existingItemResult.rows[0].id,
      ]);
    } else {
      await query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)', [
        cartId,
        productId,
        qty,
      ]);
    }

    return res.status(200).json({
      success: true,
      message: `Added "${product.name}" to cart.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:cartItemId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
    }

    const cartId = await getOrCreateCartId(userId);

    // Verify item belongs to user's cart
    const itemResult = await query(
      `SELECT ci.id, ci.product_id, p.name, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND ci.cart_id = $2`,
      [cartItemId, cartId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const item = itemResult.rows[0];

    // Validate stock
    if (newQty > item.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.stock_quantity} units of "${item.name}" are available in stock.`,
      });
    }

    await query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQty, cartItemId]);

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:cartItemId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    const cartId = await getOrCreateCartId(userId);

    const result = await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id', [
      cartItemId,
      cartId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCartId(userId);

    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Merge guest cart items from localStorage into database cart
// @route   POST /api/cart/merge
// @access  Private
const mergeCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // Array of { productId, quantity }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ success: true, message: 'No items to merge.' });
    }

    const cartId = await getOrCreateCartId(userId);

    for (const item of items) {
      const { productId, quantity } = item;
      const qty = parseInt(quantity, 10);
      if (!productId || isNaN(qty) || qty <= 0) continue;

      // Check product stock
      const prodResult = await query('SELECT stock_quantity FROM products WHERE id = $1', [productId]);
      if (prodResult.rows.length === 0) continue;

      const stock = prodResult.rows[0].stock_quantity;

      const existingItem = await query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );

      if (existingItem.rows.length > 0) {
        const mergedQty = Math.min(existingItem.rows[0].quantity + qty, stock);
        await query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [
          mergedQty,
          existingItem.rows[0].id,
        ]);
      } else {
        const mergedQty = Math.min(qty, stock);
        if (mergedQty > 0) {
          await query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)', [
            cartId,
            productId,
            mergedQty,
          ]);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Guest cart merged successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
};
