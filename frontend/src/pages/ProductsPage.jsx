import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const selectedCategory = searchParams.get('category') || 'All';
  const searchTerm = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'default';

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/products/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);
        if (sortBy && sortBy !== 'default') params.append('sort', sortBy);

        const res = await API.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        setError('Failed to fetch product catalog. Make sure backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, sortBy]);

  const handleCategoryChange = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val === 'default') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', val);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Product Catalog</h1>
        <p>Explore our curated collection of electronics, fashion, and home essentials.</p>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-group">
            <h3><Filter size={18} /> Category</h3>
            <ul className="category-list">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Products Grid */}
        <main className="catalog-main">
          {/* Top Control Bar */}
          <div className="catalog-controls">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Filter by keyword..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="catalog-search-input"
              />
            </div>

            <div className="sort-wrapper">
              <SlidersHorizontal size={18} className="sort-icon" />
              <select value={sortBy} onChange={handleSortChange} className="sort-select">
                <option value="default">Sort by: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="results-count">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
            {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
            {searchTerm && <span> matching "<strong>{searchTerm}</strong>"</span>}
          </div>

          {/* Content state */}
          {loading ? (
            <LoadingSpinner message="Searching products..." />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : products.length === 0 ? (
            <div className="empty-catalog">
              <h3>No products found</h3>
              <p>Try adjusting your search query or selecting a different category.</p>
              <button onClick={() => setSearchParams({})} className="btn btn-outline">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
