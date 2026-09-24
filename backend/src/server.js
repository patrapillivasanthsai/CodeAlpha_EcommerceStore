const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const initDb = require('./database/initDb');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

// Verify mandatory environment variables
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is missing in backend/.env!');
}

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'CodeAlpha E-Commerce Store REST API',
    version: '1.0.0',
    documentation: '/api/products',
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database & Start Express Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🚀 CodeAlpha E-Commerce Backend Server Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`================================================`);
  });
});

module.exports = app;
