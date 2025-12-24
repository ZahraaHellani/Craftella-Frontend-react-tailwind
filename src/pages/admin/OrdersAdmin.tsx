import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';

// Define TypeScript interfaces
interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  total: number;
  itemable: {
    name: string;
    image_url: string;
  };
  customization?: {
    engraving_text?: string;
  };
}

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Order {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  billing_address: Address;
  shipping_address: Address;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
  driver_id?: number;
}

interface Driver {
  id: number;
  name: string;
  email: string;
}

export const OrdersAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assigningDriver, setAssigningDriver] = useState<{ orderId: number | null; driverId: string }>({ orderId: null, driverId: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch orders
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', '10');
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);

      const response = await api.get(`/admin/orders?${params.toString()}`);
      const data = response.data || response;
      
      setOrders(Array.isArray(data) ? data : data.data || []);
      setTotalPages(response.meta?.last_page || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch drivers
  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      const data = Array.isArray(response) ? response : response.data || [];
      setDrivers(data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(currentPage); // Refresh current page
      setMessage({ type: 'success', text: 'Order status updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update order status' });
    }
  };

  // Handle driver assignment
  const handleAssignDriver = async () => {
    if (!assigningDriver.orderId || !assigningDriver.driverId) return;
    
    try {
      await api.patch(`/admin/orders/${assigningDriver.orderId}/assign-driver`, { 
        driver_id: parseInt(assigningDriver.driverId) 
      });
      fetchOrders(currentPage); // Refresh current page
      setAssigningDriver({ orderId: null, driverId: '' });
      setMessage({ type: 'success', text: 'Driver assigned successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to assign driver' });
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      const response = await api.get('/admin/orders/export');
      // In a real app, you'd handle CSV download
      alert('Export feature would download CSV file');
    } catch (error) {
      console.error('Failed to export orders:', error);
    }
  };

  // Apply filters
  const applyFilters = () => {
    fetchOrders(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '', });
    fetchOrders(1);
  };

  useEffect(() => {
    fetchOrders(1);
    fetchDrivers();
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

  if (loading && orders.length === 0) {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Order Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage all customer orders and fulfillments</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            Export to CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Range Start */}
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Date Range End */}
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
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

        {/* Orders Table */}
        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No orders found
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
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Order</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Customer</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Date</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Items</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Value</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Driver</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-100">#{order.id}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        <div>{order.user.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-500">{order.user.email}</div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                              : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                : order.status === 'shipped'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                                  : order.status === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {order.driver_id ? (
                          <div className="text-slate-600 dark:text-slate-400">
                            {drivers.find(d => d.id === order.driver_id)?.name || `Driver #${order.driver_id}`}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAssigningDriver({ orderId: order.id, driverId: '' })}
                          >
                            Assign
                          </Button>
                        )}
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                        >
                          View Details
                        </Button>
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
                    onClick={() => fetchOrders(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchOrders(currentPage + 1)}
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

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
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
                        Order #{selectedOrder.id}
                      </h3>
                      <button
                        onClick={() => setShowOrderDetails(false)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Order Summary */}
                      <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Customer:</span>
                          <span>{selectedOrder.user.name}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Email:</span>
                          <span>{selectedOrder.user.email}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Order Date:</span>
                          <span>{formatDate(selectedOrder.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-primary">{formatCurrency(selectedOrder.total)}</span>
                        </div>
                      </div>
                      
                      {/* Shipping Address */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shipping Address</h4>
                        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                          <div>{selectedOrder.shipping_address.street}</div>
                          <div>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</div>
                          <div>{selectedOrder.shipping_address.country}</div>
                        </div>
                      </div>
                      
                      {/* Billing Address */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Billing Address</h4>
                        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                          <div>{selectedOrder.billing_address.street}</div>
                          <div>{selectedOrder.billing_address.city}, {selectedOrder.billing_address.state} {selectedOrder.billing_address.postal_code}</div>
                          <div>{selectedOrder.billing_address.country}</div>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Order Items</h4>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item) => (
                            <div key={item.id} className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                              <div className="flex gap-3">
                                <img
                                  src={item.itemable.image_url || 'https://placehold.co/50x50/e2e8f0/64748b?text=Item'}
                                  alt={item.itemable.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{item.itemable.name}</div>
                                  {item.customization?.engraving_text && (
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                      Engraving: "{item.customization.engraving_text}"
                                    </div>
                                  )}
                                  <div className="text-sm mt-1">
                                    <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
                                    <span className="ml-2 font-medium">{formatCurrency(item.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {assigningDriver.orderId && (
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
                        Assign Driver
                      </h3>
                      <button
                        onClick={() => setAssigningDriver({ orderId: null, driverId: '' })}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Select Driver
                        </label>
                        <select
                          value={assigningDriver.driverId}
                          onChange={(e) => setAssigningDriver(prev => ({ ...prev, driverId: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select a driver</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} ({driver.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAssigningDriver({ orderId: null, driverId: '' })}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAssignDriver}
                          disabled={!assigningDriver.driverId}
                        >
                          Assign Driver
                        </Button>
                      </div>
                    </div>
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