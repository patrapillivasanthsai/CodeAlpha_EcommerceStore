import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, X, RotateCcw } from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: null, max: null },
  { id: 'under-1000', label: 'Under ₹1,000', min: null, max: 1000 },
  { id: '1000-5000', label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { id: '5000-10000', label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { id: 'above-10000', label: 'Above ₹10,000', min: 10000, max: null },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Accessories']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state from URL query params
  const selectedCategory = searchParams.get('category') || 'All';
  const searchTerm = searchParams.get('search') || '';
  const selectedPriceRange = searchParams.get('priceRange') || 'all';
  const sortBy = searchParams.get('sort') || 'default';

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/products/categories');
        if (res.data.success && Array.isArray(res.data.categories)) {
          const combined = Array.from(new Set(['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Accessories', ...res.data.categories]));
          setCategories(combined);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Determine min & max price based on selected price range
  const currentPriceRangeObj = PRICE_RANGES.find(r => r.id === selectedPriceRange) || PRICE_RANGES[0];

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

        if (currentPriceRangeObj.min !== null) params.append('minPrice', currentPriceRangeObj.min);
        if (currentPriceRangeObj.max !== null) params.append('maxPrice', currentPriceRangeObj.max);

        const res = await API.get(`/products?${params.toString()}`);
        if (res.data.success) {
          let list = res.data.products;

          // Client-side fallback sorting for name-asc / name-desc if needed
          if (sortBy === 'name-asc') {
            list = [...list].sort((a, b) => a.name.localeCompare(b.name));
          } else if (sortBy === 'name-desc') {
            list = [...list].sort((a, b) => b.name.localeCompare(a.name));
          }

          setProducts(list);
        }
      } catch (err) {
        setError('Failed to fetch product catalog. Make sure backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, selectedPriceRange, sortBy]);

  const updateParam = (key, value, defaultValue) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (cat) => updateParam('category', cat, 'All');
  const handleSearchChange = (e) => updateParam('search', e.target.value, '');
  const handleClearSearch = () => updateParam('search', '', '');
  const handlePriceRangeChange = (rangeId) => updateParam('priceRange', rangeId, 'all');
  const handleSortChange = (e) => updateParam('sort', e.target.value, 'default');

  const handleClearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== 'All' || searchTerm !== '' || selectedPriceRange !== 'all' || sortBy !== 'default';
  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + (searchTerm ? 1 : 0) + (selectedPriceRange !== 'all' ? 1 : 0) + (sortBy !== 'default' ? 1 : 0);

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Product Catalog</h1>
        <p>Explore our curated collection of electronics, fashion, home essentials, and accessories.</p>
      </div>

      {/* Mobile Filter & Search Toggle Bar */}
      <div className="mobile-catalog-header">
        <button
          className="mobile-filter-btn"
          onClick={() => setMobileFilterOpen(prev => !prev)}
        >
          <Filter size={18} />
          <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        </button>
        {hasActiveFilters && (
          <button onClick={handleClearAllFilters} className="btn-clear-inline">
            <RotateCcw size={14} /> Clear All
          </button>
        )}
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h3><Filter size={18} /> Filters</h3>
            <button className="close-mobile-filter" onClick={() => setMobileFilterOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Category</h4>
            <ul className="category-list">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      handleCategoryChange(cat);
                      setMobileFilterOpen(false);
                    }}
                  >
                    <span>{cat}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Price Range</h4>
            <ul className="price-range-list">
              {PRICE_RANGES.map((range) => (
                <li key={range.id}>
                  <label className={`price-range-label ${selectedPriceRange === range.id ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange === range.id}
                      onChange={() => {
                        handlePriceRangeChange(range.id);
                        setMobileFilterOpen(false);
                      }}
                    />
                    <span>{range.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Clear Filters Action */}
          {hasActiveFilters && (
            <div className="sidebar-footer">
              <button onClick={handleClearAllFilters} className="btn btn-outline btn-full btn-sm">
                <RotateCcw size={14} /> Clear All Filters
              </button>
            </div>
          )}
        </aside>

        {/* Main Products Grid */}
        <main className="catalog-main">
          {/* Top Control Bar */}
          <div className="catalog-controls">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, description or category..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="catalog-search-input"
              />
              {searchTerm && (
                <button type="button" onClick={handleClearSearch} className="search-clear-btn" title="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="sort-wrapper">
              <SlidersHorizontal size={18} className="sort-icon" />
              <select value={sortBy} onChange={handleSortChange} className="sort-select">
                <option value="default">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Results Info & Active Tags */}
          <div className="results-count-bar">
            <div className="results-count">
              Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
              {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
              {selectedPriceRange !== 'all' && <span> ({currentPriceRangeObj.label})</span>}
              {searchTerm && <span> matching "<strong>{searchTerm}</strong>"</span>}
            </div>

            {hasActiveFilters && (
              <button onClick={handleClearAllFilters} className="btn-clear-inline desktop-only">
                <RotateCcw size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* Content state */}
          {loading ? (
            <LoadingSpinner message="Searching & filtering products..." />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : products.length === 0 ? (
            <div className="empty-catalog">
              <h3>No products found</h3>
              <p>No items matched your selected filters or search query.</p>
              <button onClick={handleClearAllFilters} className="btn btn-primary">
                <RotateCcw size={16} /> Reset All Filters
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
