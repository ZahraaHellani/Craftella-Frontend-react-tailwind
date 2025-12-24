import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

// Define TypeScript interfaces
interface Souvenir {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string;
  is_customizable: boolean;
  is_featured: boolean;
  is_seasonal: boolean;
  seasonal_tag?: string;
  bulk_discount: number; // percentage
}

interface FilterOptions {
  category: string;
  isCustomizable: boolean;
  isSeasonal: boolean;
  sortBy: string;
}

export const Souvenirs: React.FC = () => {
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [filteredSouvenirs, setFilteredSouvenirs] = useState<Souvenir[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    isCustomizable: false,
    isSeasonal: false,
    sortBy: 'featured',
  });

  // Fetch souvenirs
  const fetchSouvenirs = async () => {
    try {
      const response = await api.get('/products?category=souvenir');
      const data = Array.isArray(response) ? response : response.data || [];
      setSouvenirs(data);
      applyFilters(data);
    } catch (error) {
      console.error('Failed to fetch souvenirs:', error);
      setSouvenirs([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (items: Souvenir[]) => {
    let filtered = [...items];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Customizable filter
    if (filters.isCustomizable) {
      filtered = filtered.filter(item => item.is_customizable);
    }

    // Seasonal filter
    if (filters.isSeasonal) {
      filtered = filtered.filter(item => item.is_seasonal);
    }

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    setFilteredSouvenirs(filtered);
  };

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart');
      const cart = response.data || response;
      setCartCount(cart.items?.length || 0);
    } catch (error) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchSouvenirs();
    fetchCartCount();
  }, []);

  useEffect(() => {
    applyFilters(souvenirs);
  }, [filters, searchTerm, souvenirs]);

  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleCustomizableChange = () => {
    setFilters(prev => ({ ...prev, isCustomizable: !prev.isCustomizable }));
  };

  const handleSeasonalChange = () => {
    setFilters(prev => ({ ...prev, isSeasonal: !prev.isSeasonal }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  // Add to cart
  const handleAddToCart = async (souvenirId: number, quantity: number = 1) => {
    try {
      await api.post('/cart', {
        product_id: souvenirId,
        quantity,
      });
      
      // Update cart count
      fetchCartCount();
      
      // Visual feedback
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  // Category options
  const categories = [
    { value: '', label: 'All Souvenirs' },
    { value: 'pin', label: 'Pins' },
    { value: 'mug', label: 'Mugs' },
    { value: 'cover', label: 'Phone Covers' },
    { value: 'custom', label: 'Custom Items' },
  ];

  // Seasonal tags
  const seasonalTags = ['Christmas', 'Eid', 'Graduation', 'Wedding', 'Corporate'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="bg-slate-200 dark:bg-slate-700 h-8 w-64 rounded mb-6"></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-96 w-full max-w-4xl rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-emerald-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Unique Souvenirs</h1>
            <p className="text-xl text-violet-100 max-w-2xl mx-auto">
              Personalized keepsakes for every occasion — weddings, graduations, corporate events, and more.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search souvenirs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-slate-700 dark:text-slate-300 font-medium">
                Sort by:
              </label>
              <select
                id="sort"
                value={filters.sortBy}
                onChange={handleSortChange}
                className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  filters.category === category.value
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {category.label}
              </button>
            ))}
            
            <button
              onClick={handleCustomizableChange}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                filters.isCustomizable
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Customizable
            </button>
            
            <button
              onClick={handleSeasonalChange}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                filters.isSeasonal
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Seasonal
            </button>
          </div>
        </div>

        {/* Souvenirs Grid */}
        {filteredSouvenirs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No souvenirs found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Try adjusting your filters or search term.
            </p>
            <Button
              onClick={() => {
                setFilters({ category: '', isCustomizable: false, isSeasonal: false, sortBy: 'featured' });
                setSearchTerm('');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSouvenirs.map((souvenir) => (
              <div key={souvenir.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="relative">
                  <img
                    src={souvenir.image_url || 'https://placehold.co/300x300/e2e8f0/64748b?text=Souvenir'}
                    alt={souvenir.name}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {souvenir.is_featured && (
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                    {souvenir.is_seasonal && souvenir.seasonal_tag && (
                      <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {souvenir.seasonal_tag}
                      </span>
                    )}
                    {souvenir.original_price && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        SALE
                      </span>
                    )}
                  </div>
                  
                  {/* Customizable Badge */}
                  {souvenir.is_customizable && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Custom
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2">
                    {souvenir.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                    {souvenir.description}
                  </p>
                  
                  {/* Price */}
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-primary">
                        ${souvenir.price.toFixed(2)}
                      </span>
                      {souvenir.original_price && (
                        <span className="text-sm text-slate-500 line-through">
                          ${souvenir.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {/* Bulk Discount */}
                    {souvenir.bulk_discount > 0 && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-3">
                        Bulk orders: {souvenir.bulk_discount}% off
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link to={`/products/${souvenir.id}`}
                        className="flex-1"
                      >
                        View
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(souvenir.id)}
                        className="flex-1"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Seasonal Collections Banner */}
        <div className="mt-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Seasonal Collections</h2>
          <p className="text-purple-100 max-w-2xl mx-auto mb-6">
            Celebrate special occasions with our limited-edition souvenir collections.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {seasonalTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/20 text-white rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};