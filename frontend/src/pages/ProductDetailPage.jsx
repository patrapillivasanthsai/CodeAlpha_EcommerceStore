import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const result = await addToCart(product, quantity);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } else {
      setToastMessage(result.message);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading product details..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => navigate('/products')} />;
  if (!product) return null;

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="product-detail-page">
      <Link to="/products" className="back-link">
        <ArrowLeft size={18} /> Back to Catalog
      </Link>

      <div className="product-detail-container">
        {/* Left Column: Image */}
        <div className="product-detail-image-wrapper">
          <img
            src={product.image_url || 'https://via.placeholder.com/500x500'}
            alt={product.name}
            className="product-detail-image"
          />
          <span className="category-badge-lg">{product.category}</span>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="product-detail-content">
          <h1 className="product-detail-title">{product.name}</h1>

          <div className="product-meta">
            <div className="rating-badge">
              <Star size={18} fill="#ffb703" color="#ffb703" />
              <span>{parseFloat(product.rating || 4.5).toFixed(1)}</span>
            </div>
            <div className="stock-status-wrapper">
              {isOutOfStock ? (
                <span className="stock-badge out">Out of Stock</span>
              ) : (
                <span className="stock-badge in">In Stock ({product.stock_quantity} available)</span>
              )}
            </div>
          </div>

          <div className="product-detail-price">${parseFloat(product.price).toFixed(2)}</div>

          <p className="product-detail-desc">{product.description}</p>

          {/* Action Row */}
          {!isOutOfStock && (
            <div className="quantity-selector-wrapper">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="detail-actions">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || added}
              className={`btn btn-primary btn-large btn-add-detail ${added ? 'added' : ''}`}
            >
              {added ? (
                <>
                  <Check size={20} /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={20} /> Add to Cart
                </>
              )}
            </button>
          </div>

          {toastMessage && <div className="detail-error-toast">{toastMessage}</div>}

          {/* Value Highlights */}
          <div className="value-props">
            <div className="prop-item">
              <Truck size={20} /> <span>Simulated 2-Day Express Delivery</span>
            </div>
            <div className="prop-item">
              <ShieldCheck size={20} /> <span>100% Guaranteed Transaction Security</span>
            </div>
            <div className="prop-item">
              <RefreshCw size={20} /> <span>Easy 30-Day Simulated Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
