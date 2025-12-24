import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';

// Define TypeScript interfaces
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  type: string;
  image_url: string;
  is_featured: boolean;
  has3d: boolean;
  created_at: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  type: string;
  image_url: string;
  is_featured: boolean;
  has3d: boolean;
}

export const ProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'product' | 'souvenir' | 'event_package'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not_featured'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    category: 'product',
    type: 'standard',
    image_url: '',
    is_featured: false,
    has3d: false,
  });
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', '10');
      
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (featuredFilter === 'featured') params.append('featured', '1');
      if (featuredFilter === 'not_featured') params.append('featured', '0');

      const response = await api.get(`/admin/products?${params.toString()}`);
      const data = response.data || response;
      
      setProducts(Array.isArray(data) ? data : data.data || []);
      setTotalPages(response.meta?.last_page || 1);
      setCurrentPage(page);
      setSelectedProducts([]); // Clear selections when changing pages
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to cloud storage
      // For now, we'll use a placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
      };
      
      if (editingProduct) {
        // Update existing product
        await api.put(`/admin/products/${editingProduct.id}`, productData);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        // Create new product
        await api.post(`/admin/products`, productData);
        setMessage({ type: 'success', text: 'Product created successfully!' });
      }
      
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts(currentPage);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save product' });
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.del(`/admin/products/${productId}`);
      fetchProducts(currentPage);
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete product' });
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
    
    try {
      // In a real app, you'd have a bulk delete endpoint
      // For now, delete one by one
      for (const id of selectedProducts) {
        await api.del(`/admin/products/${id}`);
      }
      fetchProducts(currentPage);
      setMessage({ type: 'success', text: 'Products deleted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete products' });
    }
  };

  // Bulk featured toggle
  const handleBulkFeaturedToggle = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      // In a real app, you'd have a bulk featured endpoint
      // For now, toggle one by one
      for (const id of selectedProducts) {
        await api.patch(`/admin/products/${id}/toggle-featured`, {});
      }
      fetchProducts(currentPage);
      setMessage({ type: 'success', text: 'Featured status updated!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update featured status' });
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all products on current page
  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  // Apply filters
  const applyFilters = () => {
    fetchProducts(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setFeaturedFilter('all');
    fetchProducts(1);
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      type: product.type,
      image_url: product.image_url,
      is_featured: product.is_featured,
      has3d: product.has3d,
    });
    setShowForm(true);
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Product Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage all products and souvenirs</p>
          </div>
          <Button onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              category: 'product',
              type: 'standard',
              image_url: '',
              is_featured: false,
              has3d: false,
            });
            setShowForm(true);
          }}>
            Add New Product
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="product">Products</option>
              <option value="souvenir">Souvenirs</option>
              <option value="event_package">Event Packages</option>
            </select>

            {/* Featured Filter */}
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Featured Status</option>
              <option value="featured">Featured Only</option>
              <option value="not_featured">Not Featured</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button onClick={applyFilters} className="px-6">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={resetFilters} className="px-6">
              Reset
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center">
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">
              {selectedProducts.length} products selected
            </span>
            <Button size="sm" variant="outline" onClick={handleBulkFeaturedToggle}>
              Toggle Featured
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedProducts([])}>
              Clear Selection
            </Button>
          </div>
        )}

        {/* Message Feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' 
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No products found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Try adjusting your filters or search term.
            </p>
            <Button onClick={resetFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300 w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Product</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Category</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Price</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Featured</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">3D Preview</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url || 'https://placehold.co/50x50/e2e8f0/64748b?text=Product'}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-100">{product.name}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 capitalize">
                        {product.category.replace('_', ' ')}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant={product.is_featured ? 'primary' : 'outline'}
                          onClick={() => api.patch(`/admin/products/${product.id}/toggle-featured`, {})}
                        >
                          {product.is_featured ? 'Featured' : 'Make Featured'}
                        </Button>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.has3d 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' 
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {product.has3d ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchProducts(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchProducts(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg leading-6 font-bold text-slate-800 dark:text-slate-100">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h3>
                      <button
                        onClick={() => setShowForm(false)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Product Image
                        </label>
                        <div className="flex items-center gap-4">
                          <img
                            src={formData.image_url || 'https://placehold.co/100x100/e2e8f0/64748b?text=Preview'}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Product Name *
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={3}
                          required
                        />
                      </div>
                      
                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Price ($) *
                        </label>
                        <Input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      
                      {/* Category */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Category *
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          >
                            <option value="product">Product</option>
                            <option value="souvenir">Souvenir</option>
                            <option value="event_package">Event Package</option>
                          </select>
                        </div>
                        
                        {/* Type */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Type *
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          >
                            <option value="standard">Standard</option>
                            <option value="customizable">Customizable</option>
                            <option value="bulk">Bulk</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                          />
                          <label className="ml-2 text-slate-700 dark:text-slate-300">
                            Featured Product
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="has3d"
                            checked={formData.has3d}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                          />
                          <label className="ml-2 text-slate-700 dark:text-slate-300">
                            3D Preview Available
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingProduct ? 'Update Product' : 'Create Product'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};