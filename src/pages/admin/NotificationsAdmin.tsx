import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Define TypeScript interfaces
interface Notification {
  id: string;
   data: {
    message: string;
    type: string;
    action_url?: string;
  };
  recipient: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  read_at: string | null;
}

export const NotificationsAdmin: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (readFilter === 'unread') params.append('unread', '1');
      if (readFilter === 'read') params.append('read', '1');

      const response = await api.get(`/admin/notifications?${params.toString()}`);
      const data = Array.isArray(response) ? response : response.data || [];
      
      setNotifications(data);
      setSelectedNotifications([]); // Clear selections when filtering
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.post(`/admin/notifications/${notificationId}/mark-read`,{});
      fetchNotifications(); // Refresh data
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle mark as unread
  const handleMarkAsUnread = async (notificationId: string) => {
    try {
      // In a real app, you'd have an unmark endpoint
      // For now, we'll simulate by removing read_at
      await api.patch(`/admin/notifications/${notificationId}/mark-unread`, {});
      fetchNotifications(); // Refresh data
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/admin/notifications/mark-all-read',{});
      fetchNotifications(); // Refresh data
      setMessage({ type: 'success', text: 'All notifications marked as read!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to mark all as read' });
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) return;
    
    try {
      // In a real app, you'd have a bulk delete endpoint
      // For now, delete one by one
      for (const id of selectedNotifications) {
        await api.del(`/admin/notifications/${id}`);
      }
      fetchNotifications(); // Refresh data
      setMessage({ type: 'success', text: 'Notifications deleted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete notifications' });
    }
  };

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Select all notifications
  const toggleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    
    try {
      await api.del('/admin/notifications/clear-all');
      fetchNotifications(); // Refresh data
      setMessage({ type: 'success', text: 'All notifications cleared!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to clear all notifications' });
    }
  };

  // Auto-refresh toggle
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up auto-refresh if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [priorityFilter, readFilter, autoRefresh]);

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
      return false;
    }
    if (readFilter === 'unread' && notification.read_at !== null) {
      return false;
    }
    if (readFilter === 'read' && notification.read_at === null) {
      return false;
    }
    return true;
  });

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && notifications.length === 0) {
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Admin Notifications</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage system alerts and user notifications</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={toggleAutoRefresh}>
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Read Status Filter */}
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
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

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center">
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">
              {selectedNotifications.length} notifications selected
            </span>
            <Button size="sm" variant="outline" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedNotifications([])}>
              Clear Selection
            </Button>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No notifications found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Try adjusting your filters or check back later.
            </p>
            <Button onClick={() => {
              setPriorityFilter('all');
              setReadFilter('all');
              fetchNotifications();
            }} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header Row */}
            <div className="border-b border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-primary focus:ring-primary mr-3"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Select All ({filteredNotifications.length})
                </span>
                <div className="ml-auto">
                  <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
                    Mark All as Read
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    !notification.read_at ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start mt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className="h-4 w-4 text-primary focus:ring-primary mt-1"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read_at ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsUnread(notification.id)}
                            >
                              Mark as Unread
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // In a real app, you'd navigate to the action_url
                              alert('Action URL would navigate to: ' + notification.data.action_url);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-slate-800 dark:text-slate-100">
                          {notification.data.message}
                        </p>
                        {notification.data.type && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-full">
                            {notification.data.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for All Notifications */}
        {notifications.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔕</div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No notifications yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              You'll receive notifications for new orders, high-value quotes, and system alerts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};