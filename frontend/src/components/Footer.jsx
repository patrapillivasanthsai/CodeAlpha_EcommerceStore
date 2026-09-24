import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section brand-info">
          <div className="footer-logo">
            <ShoppingBag size={24} />
            <span>CodeAlpha Store</span>
          </div>
          <p className="footer-desc">
            Full-stack e-commerce project built with React, Node.js, Express, and PostgreSQL for the CodeAlpha Internship.
          </p>
        </div>

        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/orders">Order History</Link></li>
          </ul>
        </div>

        <div className="footer-section categories">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/products?category=Electronics">Electronics</Link></li>
            <li><Link to="/products?category=Fashion">Fashion</Link></li>
            <li><Link to="/products?category=Home%20%26%20Kitchen">Home & Kitchen</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CodeAlpha Full Stack Development Project. Built with <Heart size={14} color="#e63946" fill="#e63946" /> for learning.</p>
      </div>
    </footer>
  );
};

export default Footer;
