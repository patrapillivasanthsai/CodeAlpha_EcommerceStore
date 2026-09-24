const express = require('express');
const { body } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', getCart);

router.post(
  '/',
  [
    body('productId').isInt().withMessage('Product ID must be an integer.'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  validateRequest,
  addToCart
);

router.post('/merge', mergeCart);

router.put(
  '/:cartItemId',
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.')],
  validateRequest,
  updateCartItem
);

router.delete('/:cartItemId', removeFromCart);

router.delete('/', clearCart);

module.exports = router;
