import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';

// Define TypeScript interfaces
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  is_suspended: boolean;
  orders_count: number;
  total_spent: number;
}

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  created_at: string;
  is_suspended: boolean;
  orders: Order[];
  addresses: Array<{
    id: number;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
  }>;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch users
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', '10');
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);

      const response = await api.get(`/admin/users?${params.toString()}`);
      const data = response.data || response;
      
      setUsers(Array.isArray(data) ? data : data.data || []);
      setTotalPages(response.meta?.last_page || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (userId: number) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response);
      setShowUserProfile(true);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Handle suspend user
  const handleSuspendUser = async (userId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.patch(`/admin/users/${userId}/activate`, {});
      } else {
        await api.patch(`/admin/users/${userId}/suspend`, {});
      }
      fetchUsers(currentPage); // Refresh current page
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      const response = await api.get('/admin/users/export');
      // In a real app, you'd handle CSV download
      alert('Export feature would download CSV file');
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  // Apply filters
  const applyFilters = () => {
    fetchUsers(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '', });
    fetchUsers(1);
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && users.length === 0) {
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">User Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage all customer accounts and activity</p>
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
                ref={searchInputRef}
                type="text"
                placeholder="Search by name or email..."
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
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
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

        {/* Users Table */}
        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No users found
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
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">User</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Email</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Joined</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Orders</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Total Spent</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-100">{user.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{user.orders_count}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {formatCurrency(user.total_spent)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_suspended 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' 
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                        }`}>
                          {user.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchUserProfile(user.id)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant={user.is_suspended ? 'secondary' : 'outline'}
                            onClick={() => handleSuspendUser(user.id, user.is_suspended)}
                          >
                            {user.is_suspended ? 'Activate' : 'Suspend'}
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
                    onClick={() => fetchUsers(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchUsers(currentPage + 1)}
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

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
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
                        {selectedUser.name}
                      </h3>
                      <button
                        onClick={() => setShowUserProfile(false)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Information</h4>
                        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                          <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                          {selectedUser.phone && <p><span className="font-medium">Phone:</span> {selectedUser.phone}</p>}
                          {selectedUser.bio && <p className="mt-2">{selectedUser.bio}</p>}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Status</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedUser.is_suspended 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                          }`}>
                            {selectedUser.is_suspended ? 'Suspended' : 'Active'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Member since {new Date(selectedUser.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Addresses</h4>
                        <div className="space-y-2">
                          {selectedUser.addresses.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400">No addresses saved</p>
                          ) : (
                            selectedUser.addresses.map((address) => (
                              <div key={address.id} className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                                <div className="font-medium">{address.street}</div>
                                <div>{address.city}, {address.state} {address.postal_code}</div>
                                <div>{address.country}</div>
                                {address.is_default && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Order History</h4>
                        <div className="space-y-2">
                          {selectedUser.orders.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400">No orders placed</p>
                          ) : (
                            selectedUser.orders.slice(0, 3).map((order) => (
                              <div key={order.id} className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                                <div className="flex justify-between">
                                  <span className="font-medium">Order #{order.id}</span>
                                  <span className="font-medium">{formatCurrency(order.total)}</span>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </div>
                                <div className="text-xs mt-1">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    order.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                      : order.status === 'processing'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                  }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                          {selectedUser.orders.length > 3 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              +{selectedUser.orders.length - 3} more orders
                            </p>
                          )}
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
    </div>
  );
};