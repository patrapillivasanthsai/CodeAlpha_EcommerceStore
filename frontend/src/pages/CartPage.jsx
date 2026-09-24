import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CartPage = () => {
  const { cartItems, subtotal, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 9.99;
  const grandTotal = parseFloat((subtotal + tax + shipping).toFixed(2));

  if (loading) return <LoadingSpinner fullScreen message="Updating cart..." />;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty-cart-container">
        <ShoppingCart size={64} className="empty-cart-icon" />
        <h2>Your Shopping Cart is Empty</h2>
        <p>Looks like you haven't added any products to your cart yet.</p>
        <Link to="/products" className="btn btn-primary">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>Your Shopping Cart</h1>
        <p>
          {!isAuthenticated && (
            <span className="guest-notice">
              Shopping as Guest. <Link to="/login">Log in</Link> to save your cart across devices.
            </span>
          )}
        </p>
      </div>

      <div className="cart-layout">
        {/* Items Table / List */}
        <div className="cart-items-container">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
            <span>Action</span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.cartItemId || item.productId} className="cart-item-row">
                <div className="item-product-info">
                  <img
                    src={item.imageUrl || item.image_url || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="item-thumbnail"
                  />
                  <div>
                    <Link to={`/products/${item.productId}`} className="item-title">
                      {item.name}
                    </Link>
                    <div className="item-unit-price">${parseFloat(item.price).toFixed(2)} each</div>
                  </div>
                </div>

                <div className="item-quantity-wrapper">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1, item.productId)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-number">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1, item.productId)}
                    disabled={item.quantity >= item.stockQuantity}
                  >
                    +
                  </button>
                </div>

                <div className="item-total-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <div className="item-actions">
                  <button
                    onClick={() => removeFromCart(item.cartItemId, item.productId)}
                    className="btn-remove-item"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions-bottom">
            <Link to="/products" className="btn btn-outline">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
            <button onClick={clearCart} className="btn-clear-cart">
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-summary-card">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total-row">
            <span>Estimated Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-large btn-checkout"
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
