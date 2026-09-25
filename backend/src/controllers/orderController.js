const { pool, query } = require('../config/db');

// @desc    Process order checkout using PostgreSQL transaction
// @route   POST /api/orders/checkout
// @access  Private
const createOrder = async (req, res, next) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body;

  if (!shippingAddress || shippingAddress.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Shipping address is required to process order.',
    });
  }

  const client = await pool.connect();

  try {
    // 1. Begin PostgreSQL Transaction
    await client.query('BEGIN');

    // 2. Fetch User's Cart Items & Product Details directly from DB (never trust frontend prices)
    const cartResult = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const cartId = cartResult.rows[0].id;

    const itemsResult = await client.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    if (itemsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Your cart has no items to checkout.' });
    }

    const cartItems = itemsResult.rows;

    // 3. Check stock and calculate prices strictly on the backend
    let subtotal = 0;
    const orderItemsToInsert = [];

    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Stock insufficient for "${item.name}". Requested: ${item.quantity}, Available: ${item.stock_quantity}.`,
        });
      }

      const unitPrice = parseFloat(item.price);
      const totalPrice = parseFloat((unitPrice * item.quantity).toFixed(2));
      subtotal += totalPrice;

      orderItemsToInsert.push({
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    subtotal = parseFloat(subtotal.toFixed(2));
    const taxAmount = parseFloat((subtotal * 0.18).toFixed(2)); // 18% GST
    const shippingFee = subtotal >= 999 ? 0.00 : 99.00; // Free shipping over ₹999
    const totalAmount = parseFloat((subtotal + taxAmount + shippingFee).toFixed(2));

    // 4. Create Order in orders table
    const orderResult = await client.query(
      `INSERT INTO orders
       (user_id, subtotal, tax_amount, shipping_fee, total_amount, shipping_address, payment_method, payment_status, order_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at`,
      [
        userId,
        subtotal,
        taxAmount,
        shippingFee,
        totalAmount,
        shippingAddress.trim(),
        paymentMethod,
        'Paid (Simulated)',
        'Processing',
      ]
    );

    const orderId = orderResult.rows[0].id;
    const createdAt = orderResult.rows[0].created_at;

    // 5. Insert Order Items & Deduct Stock Quantity for each product
    for (const item of orderItemsToInsert) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.productId, item.quantity, item.unitPrice, item.totalPrice]
      );

      // Decrement stock
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    // 6. Clear User Cart Items
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    // 7. Commit Transaction
    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: {
        id: orderId,
        subtotal,
        taxAmount,
        shippingFee,
        totalAmount,
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        paymentStatus: 'Paid (Simulated)',
        orderStatus: 'Processing',
        createdAt,
        itemCount: orderItemsToInsert.length,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Checkout transaction failed:', error);
    next(error);
  } finally {
    client.release();
  }
};

// @desc    Get current user's order history
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const ordersResult = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const orders = [];

    for (const order of ordersResult.rows) {
      const itemsResult = await query(
        `SELECT oi.id, oi.quantity, oi.unit_price, oi.total_price, p.name, p.image_url, p.category
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );

      orders.push({
        id: order.id,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.tax_amount),
        shippingFee: parseFloat(order.shipping_fee),
        totalAmount: parseFloat(order.total_amount),
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        items: itemsResult.rows.map((i) => ({
          id: i.id,
          name: i.name || 'Product no longer available',
          imageUrl: i.image_url,
          category: i.category,
          quantity: i.quantity,
          unitPrice: parseFloat(i.unit_price),
          totalPrice: parseFloat(i.total_price),
        })),
      });
    }

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const orderResult = await query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized access.',
      });
    }

    const order = orderResult.rows[0];

    const itemsResult = await query(
      `SELECT oi.id, oi.quantity, oi.unit_price, oi.total_price, p.name, p.image_url, p.category
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.tax_amount),
        shippingFee: parseFloat(order.shipping_fee),
        totalAmount: parseFloat(order.total_amount),
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        items: itemsResult.rows.map((i) => ({
          id: i.id,
          name: i.name || 'Product no longer available',
          imageUrl: i.image_url,
          category: i.category,
          quantity: i.quantity,
          unitPrice: parseFloat(i.unit_price),
          totalPrice: parseFloat(i.total_price),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
};
