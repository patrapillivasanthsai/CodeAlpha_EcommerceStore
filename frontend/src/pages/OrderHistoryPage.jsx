import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Package, Calendar, MapPin, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const OrderHistoryPage = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(location.state?.successMessage || '');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get('/orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  if (loading) return <LoadingSpinner fullScreen message="Loading order history..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Your Order History</h1>
        <p>Review past purchases, order statuses, and shipping receipts.</p>
      </div>

      {successToast && (
        <div className="success-toast-banner">
          <CheckCircle2 size={24} />
          <span>{successToast}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-cart-state">
          <Package size={52} />
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders with CodeAlpha Store yet. Start shopping!</p>
          <Link to="/products" className="btn btn-primary">
            Explore Catalog <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">Order #{order.id}</span>
                  <div className="order-date">
                    <Calendar size={14} />
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="order-badges">
                  <span className="badge status-badge">{order.orderStatus}</span>
                  <span className="badge payment-badge">{order.paymentStatus}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="order-items-grid">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="order-item-thumb"
                    />
                    <div className="order-item-details">
                      <h4>{item.name}</h4>
                      <p>Category: {item.category || 'General'}</p>
                      <span>
                        Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="order-item-total">₹{item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="order-card-footer">
                <div className="footer-meta">
                  <div className="meta-line">
                    <MapPin size={16} /> <strong>Ship To:</strong> {order.shippingAddress}
                  </div>
                  <div className="meta-line">
                    <CreditCard size={16} /> <strong>Payment:</strong> {order.paymentMethod}
                  </div>
                </div>

                <div className="order-pricing-breakdown">
                  <div className="price-row">Subtotal: ₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div className="price-row">GST (18%): ₹{order.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div className="price-row">Shipping: {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee.toFixed(2)}`}</div>
                  <div className="price-row grand-total">Total: ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
