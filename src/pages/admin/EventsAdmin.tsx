import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';

// Define TypeScript interfaces
interface EventCategory {
  id: string;
  name: string;
  description: string;
}

interface EventPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  created_at: string;
}

interface EventBooking {
  id: number;
  user: {
    name: string;
    email: string;
  };
  package: {
    name: string;
    price: number;
  };
  event_date: string;
  status: string;
  created_at: string;
}

interface QuoteRequest {
  id: number;
  user: {
    name: string;
    email: string;
  };
  event_type: string;
  event_date: string;
  guest_count: number;
  budget: number;
  message: string;
  status: string;
  created_at: string;
}

export const EventsAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'packages' | 'bookings' | 'quotes'>('categories');
  
  // Categories state
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  
  // Packages state
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<EventPackage | null>(null);
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
  });
  
  // Bookings state
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  
  // Quotes state
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch all event data
  const fetchEventData = async () => {
    setLoading(true);
    try {
      const [categoryResponse, packageResponse, bookingResponse, quoteResponse] = await Promise.all([
        api.get('/admin/event-categories'),
        api.get('/admin/event-packages'),
        api.get('/admin/event-bookings'),
        api.get('/admin/quote-requests')
      ]);

      setCategories(Array.isArray(categoryResponse) ? categoryResponse : categoryResponse.data || []);
      setPackages(Array.isArray(packageResponse) ? packageResponse : packageResponse.data || []);
      setBookings(Array.isArray(bookingResponse) ? bookingResponse : bookingResponse.data || []);
      setQuotes(Array.isArray(quoteResponse) ? quoteResponse : quoteResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch event data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle category form submission
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      if (editingCategory) {
        await api.put(`/admin/event-categories/${editingCategory.id}`, categoryFormData);
        setMessage({ type: 'success', text: 'Category updated successfully!' });
      } else {
        await api.post(`/admin/event-categories`, categoryFormData);
        setMessage({ type: 'success', text: 'Category created successfully!' });
      }
      
      setShowCategoryForm(false);
      setEditingCategory(null);
      fetchEventData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save category' });
    }
  };

  // Handle package form submission
  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      const packageData = {
        ...packageFormData,
        price: parseFloat(packageFormData.price),
      };
      
      if (editingPackage) {
        await api.put(`/admin/event-packages/${editingPackage.id}`, packageData);
        setMessage({ type: 'success', text: 'Package updated successfully!' });
      } else {
        await api.post(`/admin/event-packages`, packageData);
        setMessage({ type: 'success', text: 'Package created successfully!' });
      }
      
      setShowPackageForm(false);
      setEditingPackage(null);
      fetchEventData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save package' });
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? All packages in this category will be affected.')) return;
    
    try {
      await api.del(`/admin/event-categories/${categoryId}`);
      fetchEventData();
      setMessage({ type: 'success', text: 'Category deleted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete category' });
    }
  };

  // Delete package
  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      await api.del(`/admin/event-packages/${packageId}`);
      fetchEventData();
      setMessage({ type: 'success', text: 'Package deleted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete package' });
    }
  };

  // Handle booking status update
  const handleBookingStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/event-bookings/${bookingId}/status`, { status: newStatus });
      fetchEventData();
      setMessage({ type: 'success', text: 'Booking status updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update booking status' });
    }
  };

  // Handle quote approval
  const handleApproveQuote = async (quoteId: number) => {
    try {
      await api.patch(`/admin/quote-requests/${quoteId}/approve`,{});
      fetchEventData();
      setMessage({ type: 'success', text: 'Quote request approved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to approve quote request' });
    }
  };

  // Handle quote rejection
  const handleRejectQuote = async (quoteId: number) => {
    try {
      await api.patch(`/admin/quote-requests/${quoteId}/reject`,{});
      fetchEventData();
      setMessage({ type: 'success', text: 'Quote request rejected successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to reject quote request' });
    }
  };

  // Filter bookings
  const filteredBookings = bookingStatusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === bookingStatusFilter);

  // Filter quotes
  const filteredQuotes = quoteStatusFilter === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.status === quoteStatusFilter);

  useEffect(() => {
    fetchEventData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Event Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage event categories, packages, bookings, and quotes</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['categories', 'packages', 'bookings', 'quotes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full font-medium capitalize transition-colors duration-300 ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

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

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Event Categories</h2>
              <Button onClick={() => {
                setEditingCategory(null);
                setCategoryFormData({ name: '', description: '' });
                setShowCategoryForm(true);
              }}>
                Add Category
              </Button>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🏷️</div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">
                  No categories created
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Create your first event category to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">{category.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryFormData({ name: category.name, description: category.description });
                            setShowCategoryForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Event Packages</h2>
              <Button onClick={() => {
                setEditingPackage(null);
                setPackageFormData({
                  name: '',
                  description: '',
                  price: '',
                  category_id: categories.length > 0 ? categories[0].id : '',
                  image_url: '',
                });
                setShowPackageForm(true);
              }}>
                Add Package
              </Button>
            </div>
            
            {packages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">
                  No packages created
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Create your first event package to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Package</th>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Category</th>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Price</th>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="p-4">
                          <div className="font-medium text-slate-800 dark:text-slate-100">{pkg.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {pkg.description}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {categories.find(c => c.id === pkg.category_id)?.name || 'Unknown'}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {formatCurrency(pkg.price)}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPackage(pkg);
                                setPackageFormData({
                                  name: pkg.name,
                                  description: pkg.description,
                                  price: pkg.price.toString(),
                                  category_id: pkg.category_id,
                                  image_url: pkg.image_url,
                                });
                                setShowPackageForm(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePackage(pkg.id)}
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
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Event Bookings</h2>
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value as any)}
                className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">
                  No bookings found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {bookingStatusFilter === 'all' ? 'No bookings have been made yet.' : 'No bookings with this status.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Booking</th>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Customer</th>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Event Date</th>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Package</th>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Value</th>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                      <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="p-4 font-medium text-slate-800 dark:text-slate-100">#{booking.id}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          <div>{booking.user.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-500">{booking.user.email}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {formatDate(booking.event_date)}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{booking.package.name}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {formatCurrency(booking.package.price)}
                        </td>
                        <td className="p-4">
                          <select
                            value={booking.status}
                            onChange={(e) => handleBookingStatusUpdate(booking.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                : booking.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                  : booking.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quote Requests</h2>
              <select
                value={quoteStatusFilter}
                onChange={(e) => setQuoteStatusFilter(e.target.value as any)}
                className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">
                  No quote requests found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {quoteStatusFilter === 'all' ? 'No quote requests have been submitted yet.' : 'No quote requests with this status.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuotes.map((quote) => (
                  <div key={quote.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-100">
                          {quote.user.name} - {quote.event_type}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {quote.user.email} • {formatDate(quote.created_at)}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quote.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                          : quote.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      }`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Date:</span>
                        <div className="ml-2 text-slate-600 dark:text-slate-400">{formatDate(quote.event_date)}</div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Guests:</span>
                        <div className="ml-2 text-slate-600 dark:text-slate-400">{quote.guest_count}</div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Budget:</span>
                        <div className="ml-2 text-slate-600 dark:text-slate-400">{formatCurrency(quote.budget)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Message:</span>
                      <div className="mt-1 text-slate-600 dark:text-slate-400">{quote.message}</div>
                    </div>
                    
                    {quote.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleApproveQuote(quote.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRejectQuote(quote.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg leading-6 font-bold text-slate-800 dark:text-slate-100">
                        {editingCategory ? 'Edit Category' : 'Add Category'}
                      </h3>
                      <button
                        onClick={() => setShowCategoryForm(false)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Category Name *
                        </label>
                        <Input
                          type="text"
                          value={categoryFormData.name}
                          onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={categoryFormData.description}
                          onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingCategory ? 'Update Category' : 'Create Category'}
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

      {/* Package Form Modal */}
      {showPackageForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg leading-6 font-bold text-slate-800 dark:text-slate-100">
                        {editingPackage ? 'Edit Package' : 'Add Package'}
                      </h3>
                      <button
                        onClick={() => setShowPackageForm(false)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handlePackageSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Package Name *
                        </label>
                        <Input
                          type="text"
                          value={packageFormData.name}
                          onChange={(e) => setPackageFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={packageFormData.description}
                          onChange={(e) => setPackageFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Price ($) *
                        </label>
                        <Input
                          type="number"
                          value={packageFormData.price}
                          onChange={(e) => setPackageFormData(prev => ({ ...prev, price: e.target.value }))}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Category *
                        </label>
                        <select
                          value={packageFormData.category_id}
                          onChange={(e) => setPackageFormData(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Image URL
                        </label>
                        <Input
                          type="text"
                          value={packageFormData.image_url}
                          onChange={(e) => setPackageFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowPackageForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingPackage ? 'Update Package' : 'Create Package'}
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