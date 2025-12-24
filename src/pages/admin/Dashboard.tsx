import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { Link } from 'react-router';

// Define TypeScript interfaces
interface AnalyticsData {
  total_revenue: number;
  total_orders: number;
  total_users: number;
  average_order_value: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  is_suspended: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  is_featured: boolean;
}

interface Order {
  id: number;
  user: { name: string };
  total: number;
  status: string;
  created_at: string;
}

interface Notification {
  id: string;
  data: {
    message: string;
    type: string;
  };
  created_at: string;
  read_at: string | null;
}

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'orders' | 'notifications'>('overview');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [analyticsResponse, usersResponse, productsResponse, ordersResponse, notificationsResponse] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/users?per_page=5'),
        api.get('/admin/products?per_page=5'),
        api.get('/admin/orders?per_page=5'),
        api.get('/admin/notifications?per_page=5')
      ]);

      setAnalytics(analyticsResponse);
      setUsers(Array.isArray(usersResponse) ? usersResponse : usersResponse?.data || []);
      setProducts(Array.isArray(productsResponse) ? productsResponse : productsResponse?.data || []);
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : ordersResponse?.data || []);
      setNotifications(Array.isArray(notificationsResponse) ? notificationsResponse : notificationsResponse?.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle suspend user
  const handleSuspendUser = async (userId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.patch(`/admin/users/${userId}/activate`, {});
      } else {
        await api.patch(`/admin/users/${userId}/suspend`, {});
      }
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  // Handle featured toggle
  const handleToggleFeatured = async (productId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/products/${productId}/toggle-featured`, {});
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  // Handle mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.post(`/admin/notifications/${notificationId}/mark-read`, {});
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your Craftella platform</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['overview', 'users', 'products', 'orders', 'notifications'] as const).map((tab) => (
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

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {formatCurrency(analytics.total_revenue)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Orders</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {analytics.total_orders.toLocaleString()}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Users</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {analytics.total_users.toLocaleString()}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Avg. Order Value</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {formatCurrency(analytics.average_order_value)}
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Sales Trend (Last 7 Days)</h3>
                <div className="h-64 flex items-end justify-between">
                  {[20, 40, 60, 80, 70, 90, 100].map((height, index) => (
                    <div key={index} className="w-8 bg-primary rounded-t" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">User Growth (Last 30 Days)</h3>
                <div className="h-64 flex items-end justify-between">
                  {[10, 25, 40, 35, 50, 65, 80].map((height, index) => (
                    <div key={index} className="w-8 bg-emerald-500 rounded-t" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">User Management</h2>
              <Link to="/admin/users">
                View All Users
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Name</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Email</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Joined</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-100">{user.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
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
                        <Button
                          size="sm"
                          variant={user.is_suspended ? 'outline' : 'secondary'}
                          onClick={() => handleSuspendUser(user.id, user.is_suspended)}
                        >
                          {user.is_suspended ? 'Activate' : 'Suspend'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Product Management</h2>
              <Link to="/admin/products">
                View All Products
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Product</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Category</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Price</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Featured</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-100">{product.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 capitalize">{product.category}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant={product.is_featured ? 'primary' : 'outline'}
                          onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                        >
                          {product.is_featured ? 'Featured' : 'Make Featured'}
                        </Button>
                      </td>
                      <td className="p-4">
                        <Link to={`/admin/products/${product.id}`}>
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Order Management</h2>
              <Link to="/admin/orders">
                View All Orders
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Order</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Customer</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Value</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-100">#{order.id}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{order.user.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                              : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                : order.status === 'shipped'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
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
                        <Link to={`/admin/orders/${order.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Admin Notifications</h2>
              <Button
                variant="outline"
                onClick={() => fetchDashboardData()}
              >
                Refresh
              </Button>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 ${
                      !notification.read_at 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between">
                      <p className="text-slate-800 dark:text-slate-100">
                        {notification.data.message}
                      </p>
                      <div className="flex gap-2">
                        {!notification.read_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};