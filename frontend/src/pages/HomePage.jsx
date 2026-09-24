import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await API.get('/products');
        if (res.data.success) {
          setFeaturedProducts(res.data.products.slice(0, 4));
        }
      } catch (err) {
        setError('Failed to load featured products from backend API.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">
            <Sparkles size={16} /> CodeAlpha Internship Showcase
          </span>
          <h1 className="hero-title">
            Discover Quality Products for Your Everyday Lifestyle
          </h1>
          <p className="hero-subtitle">
            Experience seamless e-commerce with real-time stock updates, simulated checkout transactions, and safe JWT authentication.
          </p>
          <div className="hero-cta">
            <Link to="/products" className="btn btn-primary btn-large">
              Shop All Catalog <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-grid">
        <div className="feature-card">
          <Truck className="feature-icon" size={32} />
          <h3>Fast Delivery</h3>
          <p>Simulated instant shipping tracking across all categories.</p>
        </div>
        <div className="feature-card">
          <ShieldCheck className="feature-icon" size={32} />
          <h3>Secure Checkout</h3>
          <p>Protected JWT endpoints and PostgreSQL database transactions.</p>
        </div>
        <div className="feature-card">
          <Clock className="feature-icon" size={32} />
          <h3>24/7 Availability</h3>
          <p>Explore inventory, update your cart, and review order history anytime.</p>
        </div>
      </section>

      {/* Category Quick Filter */}
      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-cards">
          <Link to="/products?category=Electronics" className="category-card cat-electronics">
            <h3>Electronics</h3>
            <p>Headphones, Keyboards, Smartwatches</p>
          </Link>
          <Link to="/products?category=Fashion" className="category-card cat-fashion">
            <h3>Fashion</h3>
            <p>Jackets, Bags & Accessories</p>
          </Link>
          <Link to="/products?category=Home%20%26%20Kitchen" className="category-card cat-home">
            <h3>Home & Kitchen</h3>
            <p>Tumblers, Diffusers & Essentials</p>
          </Link>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/products" className="link-see-all">
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching featured items..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
