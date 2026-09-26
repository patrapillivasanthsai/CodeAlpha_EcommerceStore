import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, CheckCircle, Truck, ShieldCheck, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <ShoppingBag size={22} />
            <span>CodeAlpha Store</span>
          </div>
          <p className="footer-tagline">
            Your trusted destination for quality electronics, fashion, and home essentials.
            Built with modern web technologies for a seamless shopping experience.
          </p>
          <div className="footer-trust">
            <span className="trust-item"><CheckCircle size={14} /> Secure JWT Authentication</span>
            <span className="trust-item"><CheckCircle size={14} /> Real-time Cart Sync</span>
            <span className="trust-item"><CheckCircle size={14} /> INR Pricing &amp; 18% GST</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/orders">Order History</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/products?category=Electronics">Electronics</Link></li>
            <li><Link to="/products?category=Fashion">Fashion</Link></li>
            <li><Link to="/products?category=Home%20%26%20Kitchen">Home &amp; Kitchen</Link></li>
          </ul>
        </div>

        {/* Features */}
        <div className="footer-col">
          <h4>Why Us</h4>
          <ul>
            <li><Link to="/"><Truck size={13} style={{display:'inline', marginRight:'6px'}} />Fast Delivery</Link></li>
            <li><Link to="/"><ShieldCheck size={13} style={{display:'inline', marginRight:'6px'}} />Safe Checkout</Link></li>
            <li><Link to="/"><Phone size={13} style={{display:'inline', marginRight:'6px'}} />24/7 Support</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span>© {new Date().getFullYear()} CodeAlpha E-Commerce Store.</span>
        </div>
        <div className="footer-bottom-right">
          <span>Built with</span>
          <Heart size={13} color="#e63946" fill="#e63946" />
          <span>for the CodeAlpha Internship</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
