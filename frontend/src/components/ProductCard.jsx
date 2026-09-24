import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const result = await addToCart(product, 1);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-link">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x300?text=Product'}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        <span className="category-tag">{product.category}</span>
      </Link>

      <div className="product-info">
        <div className="product-rating">
          <Star size={16} className="star-icon" fill="#ffb703" color="#ffb703" />
          <span>{product.rating ? parseFloat(product.rating).toFixed(1) : '4.5'}</span>
          <span className="stock-info">
            {isOutOfStock ? (
              <span className="out-of-stock">Out of Stock</span>
            ) : (
              <span className="in-stock">{product.stock_quantity} left</span>
            )}
          </span>
        </div>

        <Link to={`/products/${product.id}`} className="product-title-link">
          <h3 className="product-title">{product.name}</h3>
        </Link>

        <p className="product-desc-short">
          {product.description?.length > 80
            ? `${product.description.substring(0, 80)}...`
            : product.description}
        </p>

        <div className="product-card-footer">
          <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || added}
            className={`btn-add-cart ${added ? 'added' : ''}`}
          >
            {added ? (
              <>
                <Check size={18} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={18} /> Add
              </>
            )}
          </button>
        </div>

        {message && <div className="card-error-toast">{message}</div>}
      </div>
    </div>
  );
};

export default ProductCard;
