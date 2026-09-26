import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Truck, Headphones,
  Sparkles, Star, RefreshCw, Package, Zap
} from 'lucide-react';
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
        setError('Failed to load featured products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            <Sparkles size={14} /> India's Smart Shopping Destination
          </span>
          <h1 className="hero-title">
            Shop Smarter,<br />
            <span>Live Better.</span>
          </h1>
          <p className="hero-subtitle">
            Discover curated electronics, fashion, and home essentials — all priced in ₹ for the Indian market.
            Secure checkout, fast delivery, and a seamless experience you'll love.
          </p>
          <div className="hero-cta">
            <Link to="/products" className="btn-hero-primary">
              Explore Products <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn-hero-secondary">
              Create Account
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat-item">
              <span className="hero-stat-number">8+</span>
              <span className="hero-stat-label">Curated Products</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">3</span>
              <span className="hero-stat-label">Categories</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">18%</span>
              <span className="hero-stat-label">GST Included</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">₹99</span>
              <span className="hero-stat-label">Flat Shipping</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <div className="trust-strip">
        <div className="trust-card">
          <div className="trust-card-icon"><Truck size={28} /></div>
          <h3>Fast Delivery</h3>
          <p>₹99 flat shipping, free above ₹999 order value</p>
        </div>
        <div className="trust-card">
          <div className="trust-card-icon"><ShieldCheck size={28} /></div>
          <h3>Secure Checkout</h3>
          <p>JWT-protected accounts and PostgreSQL-backed transactions</p>
        </div>
        <div className="trust-card">
          <div className="trust-card-icon"><RefreshCw size={28} /></div>
          <h3>Easy Returns</h3>
          <p>Hassle-free return policy on all eligible products</p>
        </div>
        <div className="trust-card">
          <div className="trust-card-icon"><Headphones size={28} /></div>
          <h3>24/7 Support</h3>
          <p>Customer support available round the clock</p>
        </div>
      </div>

      {/* ── Categories ── */}
      <section className="categories-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find exactly what you're looking for</p>
          </div>
          <Link to="/products" className="link-see-all">
            All Products <ArrowRight size={15} />
          </Link>
        </div>
        <div className="category-cards">
          <Link to="/products?category=Electronics" className="category-card cat-electronics">
            <div className="category-icon-wrap"><Zap size={24} /></div>
            <h3>Electronics</h3>
            <p>Headphones, Keyboards, Smartwatches &amp; More</p>
            <ArrowRight size={18} className="cat-arrow" />
          </Link>
          <Link to="/products?category=Fashion" className="category-card cat-fashion">
            <div className="category-icon-wrap">👗</div>
            <h3>Fashion</h3>
            <p>Jackets, Bags &amp; Everyday Accessories</p>
            <ArrowRight size={18} className="cat-arrow" />
          </Link>
          <Link to="/products?category=Home%20%26%20Kitchen" className="category-card cat-home">
            <div className="category-icon-wrap">🏠</div>
            <h3>Home &amp; Kitchen</h3>
            <p>Tumblers, Diffusers &amp; Home Essentials</p>
            <ArrowRight size={18} className="cat-arrow" />
          </Link>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="featured-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked for quality and value</p>
          </div>
          <Link to="/products" className="link-see-all">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading featured products..." />
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

      {/* ── Why Choose Us ── */}
      <section className="why-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose CodeAlpha Store?</h2>
          <p className="section-subtitle">Built for the Indian market, designed for you</p>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon-wrap"><Star size={26} /></div>
            <div>
              <h3>Genuine Products</h3>
              <p>Every product is verified for quality. No counterfeits, no compromises.</p>
            </div>
          </div>
          <div className="why-card">
            <div className="why-icon-wrap"><ShieldCheck size={26} /></div>
            <div>
              <h3>Safe &amp; Secure</h3>
              <p>Your data is encrypted and protected. Shop with complete peace of mind.</p>
            </div>
          </div>
          <div className="why-card">
            <div className="why-icon-wrap"><Package size={26} /></div>
            <div>
              <h3>Track Everything</h3>
              <p>Full order history with itemised GST breakdown in your account dashboard.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
