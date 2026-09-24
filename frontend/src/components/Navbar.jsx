import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo">
          <ShoppingBag className="logo-icon" size={28} />
          <span className="logo-text">CodeAlpha<span className="logo-accent">Store</span></span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="navbar-search">
          <input
            type="text"
            placeholder="Search products, electronics, fashion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <Search size={18} />
          </button>
        </form>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Shop Catalog</Link>

          {/* Cart Icon Link */}
          <Link to="/cart" className="nav-link cart-link" aria-label="Shopping Cart">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/orders" className="nav-link icon-link" title="Order History">
                <Package size={20} />
                <span>Orders</span>
              </Link>
              <div className="user-info">
                <User size={18} />
                <span className="user-name">{user?.name}</span>
              </div>
              <button onClick={logout} className="btn-logout" title="Log Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
