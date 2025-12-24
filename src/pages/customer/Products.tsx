import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/customer/ProductCard';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

// Define TypeScript interfaces
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  is_featured: boolean;
}

interface FilterOptions {
  category: string;
  minPrice: string;
  maxPrice: string;
  featuredOnly: boolean;
  sortBy: string;
}

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLDivElement>(null);

  // Initialize filters from URL params or defaults
  const initialFilters: FilterOptions = {
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featuredOnly: searchParams.get('featuredOnly') === 'true',
    sortBy: searchParams.get('sortBy') || 'created_at_desc',
  };

  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch products
  const fetchProducts = async (page = 1) => {
    try {
      const params = new URLSearchParams();
      
      // Add filter params
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.featuredOnly) params.append('featured', '1');
      
      // Add sort param
      const [field, direction] = filters.sortBy.split('_');
      params.append('sort_field', field);
      params.append('sort_direction', direction);
      
      // Add pagination
      params.append('page', page.toString());
      params.append('per_page', '12');

      const queryString = params.toString();
      const response = await api.get(`/products${queryString ? `?${queryString}` : ''}`);
      
      const data = Array.isArray(response) ? response : response.data || [];
      const meta = response.meta || { current_page: 1, last_page: 1 };

      if (page === 1) {
        setProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
      }

      setHasMore(meta.current_page < meta.last_page);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      if (page === 1) setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setLoading(true);
    const newParams = new URLSearchParams();

    // Update URL params
    if (filters.category) newParams.set('category', filters.category);
    if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
    if (filters.featuredOnly) newParams.set('featuredOnly', 'true');
    if (filters.sortBy !== 'created_at_desc') newParams.set('sortBy', filters.sortBy);

    setSearchParams(newParams, { replace: true });
    fetchProducts(1);
    setIsFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    const resetFilters: FilterOptions = {
      category: '',
      minPrice: '',
      maxPrice: '',
      featuredOnly: false,
      sortBy: 'created_at_desc',
    };
    setFilters(resetFilters);
    setSearchParams({}, { replace: true });
    setLoading(true);
    fetchProducts(1);
    setIsFilterOpen(false);
  };

  // Handle infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        const page = Math.floor(products.length / 12) + 1;
        fetchProducts(page);
      }
    };

    observer.current = new IntersectionObserver(observerCallback);
    if (lastProductRef.current) {
      observer.current.observe(lastProductRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, loading, products.length]);

  // Fetch initial products
  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Update URL when filters change (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (loading) return;
      applyFilters();
    }, 300);

    return () => clearTimeout(handler);
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.featuredOnly]);

  // Handle sort change immediately
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-emerald-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Our Creative Collection</h1>
            <p className="text-xl text-violet-100 max-w-2xl mx-auto">
              Discover unique products, souvenirs, and event packages crafted with care.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Products ({products.length})
            </h2>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filters
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-slate-700 dark:text-slate-300 font-medium">
                Sort by:
              </label>
              <select
                id="sort"
                value={filters.sortBy}
                onChange={handleSortChange}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="created_at_desc">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name A-Z</option>
              </select>
            </div>

            {/* Desktop Filters */}
            <Button
              onClick={() => setIsFilterOpen(true)}
              className="hidden md:flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filters
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
                <div className="bg-slate-200 dark:bg-slate-700 h-48 w-full"></div>
                <div className="p-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  ref={index === products.length - 1 ? lastProductRef : null}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {loading && products.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 mt-8 py-4">
                You've reached the end of the collection.
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No products found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Try adjusting your filters.
            </p>
            <Button onClick={resetFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-slate-800 shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Categories</option>
                    <option value="product">Products</option>
                    <option value="souvenir">Souvenirs</option>
                    <option value="event_package">Event Packages</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Featured Only */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={filters.featuredOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, featuredOnly: e.target.checked }))}
                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-slate-700 dark:text-slate-300">
                    Featured Only
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="flex-1"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={applyFilters}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};