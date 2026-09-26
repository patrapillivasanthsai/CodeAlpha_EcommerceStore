import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Search, User, LogOut, Package,
  ShoppingCart, Sun, Moon, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobile}>
          <ShoppingBag className="logo-icon" size={26} />
          <span>CodeAlpha<span className="logo-accent">Store</span></span>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} className="navbar-search">
          <input
            type="text"
            placeholder="Search products, electronics, fashion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            <Search size={17} />
          </button>
        </form>

        {/* Desktop Navigation */}
        <nav className="navbar-nav" aria-label="Main navigation">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Shop</Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart */}
          <Link to="/cart" className="cart-link" aria-label={`Shopping cart, ${cartCount} items`}>
            <ShoppingCart size={21} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/orders" className="nav-link" title="Order History">
                <Package size={19} />
              </Link>
              <div className="user-info">
                <User size={16} />
                <span>{user?.name?.split(' ')[0]}</span>
              </div>
              <button onClick={logout} className="btn-logout" title="Log Out">
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1, padding: '9px 14px', borderRadius: '8px',
              border: '1.5px solid var(--border-color)',
              background: 'var(--background)', color: 'var(--text-main)',
              fontSize: '0.9rem'
            }}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <Link to="/" className="mobile-nav-link" onClick={closeMobile}>
          <ShoppingBag size={18} /> Home
        </Link>
        <Link to="/products" className="mobile-nav-link" onClick={closeMobile}>
          <Search size={18} /> Shop All
        </Link>
        <Link to="/cart" className="mobile-nav-link" onClick={closeMobile}>
          <ShoppingCart size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/orders" className="mobile-nav-link" onClick={closeMobile}>
              <Package size={18} /> My Orders
            </Link>
            <button
              onClick={() => { logout(); closeMobile(); }}
              className="mobile-nav-link"
              style={{ width: '100%', textAlign: 'left', color: 'var(--danger)' }}
            >
              <LogOut size={18} /> Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-nav-link" onClick={closeMobile}>
              <User size={18} /> Log In
            </Link>
            <Link to="/register" className="mobile-nav-link" onClick={closeMobile}>
              <User size={18} /> Sign Up
            </Link>
          </>
        )}

        <button
          onClick={toggleTheme}
          className="mobile-nav-link"
          style={{ width: '100%', textAlign: 'left' }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
