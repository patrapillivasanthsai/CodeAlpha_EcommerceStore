const express = require('express');
const { body } = require('express-validator');
const { createOrder, getUserOrders, getOrderById } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

router.post(
  '/checkout',
  [body('shippingAddress').trim().notEmpty().withMessage('Shipping address is required.')],
  validateRequest,
  createOrder
);

router.get('/', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router;
