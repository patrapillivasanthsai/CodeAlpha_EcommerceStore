import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Banknote, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CheckoutPage = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const tax = parseFloat((subtotal * 0.18).toFixed(2));
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const grandTotal = parseFloat((subtotal + tax + shipping).toFixed(2));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Please enter your shipping address.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await API.post('/orders/checkout', {
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
      });

      if (res.data.success) {
        await clearCart();
        navigate('/orders', {
          state: {
            successMessage: `Order #${res.data.order.id} placed successfully!`,
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Order processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !submitting) {
    return (
      <div className="empty-cart-state">
        <h2>Nothing to Checkout</h2>
        <p>Your cart is empty. Add some products before proceeding to checkout.</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="page-header">
        <h1>Secure Checkout</h1>
        <p>Complete your order details below. All transactions are simulated for demo purposes.</p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        {/* Shipping & Payment Details */}
        <div className="checkout-main-form">
          <section className="form-section">
            <h2>1. Shipping Address</h2>
            <div className="form-group">
              <label htmlFor="address">Full Delivery Address *</label>
              <textarea
                id="address"
                rows="3"
                placeholder="Plot 42, Hitech City, Hyderabad, Telangana 500081"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </div>
          </section>

          <section className="form-section">
            <h2>2. Payment Method (Simulated)</h2>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Banknote size={24} />
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p>Pay with cash upon package arrival.</p>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'Demo Payment Gateway' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="Demo Payment Gateway"
                  checked={paymentMethod === 'Demo Payment Gateway'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <CreditCard size={24} />
                <div>
                  <strong>Demo Card / UPI Payment (Simulator)</strong>
                  <p>Simulates instant payment authorization for testing.</p>
                </div>
              </label>
            </div>
          </section>

          <div className="security-notice">
            <ShieldCheck size={20} />
            <span>This is a simulated internship order workflow. No real charges or credit cards are processed.</span>
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="checkout-summary-sidebar">
          <h3>Order Review ({cartItems.length} items)</h3>
          
          <div className="preview-items-list">
            {cartItems.map((item) => (
              <div key={item.cartItemId || item.productId} className="preview-item">
                <span className="preview-item-name">{item.name} ×{item.quantity}</span>
                <span className="preview-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row">
            <span>GST (18%)</span>
            <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Grand Total</span>
            <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-large btn-place-order"
          >
            {submitting ? (
              <LoadingSpinner message="Placing Order..." />
            ) : (
              <>
                <CheckCircle size={20} /> Complete Order Placement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
