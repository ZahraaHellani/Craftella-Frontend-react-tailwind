import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';
import { Link } from 'react-router';

// Define TypeScript interfaces
interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  phone?: string;
  location?: string;
}

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface Order {
  id: number;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    itemable: {
      name: string;
    };
    quantity: number;
  }>;
}

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'account' | 'addresses' | 'orders'>('account');
  const [user, setUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id' | 'is_default'>>({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const [userResponse, addressResponse, orderResponse] = await Promise.all([
        api.get('/profile'),
        api.get('/profile/addresses'),
        api.get('/orders')
      ]);

      const userData = userResponse.data || userResponse;
      const addressData = Array.isArray(addressResponse) ? addressResponse : addressResponse.data || [];
      const orderData = Array.isArray(orderResponse) ? orderResponse : orderResponse.data || [];

      setUser(userData);
      setEditingUser(userData);
      setAddresses(addressData);
      setOrders(orderData);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Save account changes
  const handleSaveAccount = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/profile', editingUser);
      setUser(editingUser);
      setMessage({ type: 'success', text: 'Account updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update account' });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setSaving(true);
    setMessage(null);
    try {
      await api.post('/profile/change-password', {
        current_password: password.current,
        password: password.new,
        password_confirmation: password.confirm,
      });
      setPassword({ current: '', new: '', confirm: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  // Save new address
  const handleSaveAddress = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await api.post('/profile/addresses', newAddress);
      setAddresses([...addresses, response]);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      });
      setMessage({ type: 'success', text: 'Address added successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to add address' });
    } finally {
      setSaving(false);
    }
  };

  // Update existing address
  const handleUpdateAddress = async () => {
  if (!editingAddress) return;
  
  setSaving(true);
  setMessage(null);
  try {
    const response = await api.put(`/profile/addresses/${editingAddress.id}`, editingAddress);
    
    // ✅ Correct way to update state
    setAddresses(addresses.map(addr => 
      addr.id === editingAddress.id ? response : addr
    ));
    
    setEditingAddress(null);
    setMessage({ type: 'success', text: 'Address updated successfully!' });
  } catch (error: any) {
    setMessage({ type: 'error', text: error.message || 'Failed to update address' });
  } finally {
    setSaving(false);
  }
};

  // Delete address
  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    setSaving(true);
    setMessage(null);
    try {
      await api.del(`/profile/addresses/${id}`);
      setAddresses(addresses.filter(addr => addr.id !== id));
      setMessage({ type: 'success', text: 'Address deleted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete address' });
    } finally {
      setSaving(false);
    }
  };

  // Set default address
  const handleSetDefault = async (id: number) => {
  if (!confirm('Are you sure you want to delete this address?')) return;
  
  setSaving(true);
  setMessage(null);
  try {
    // ✅ Pass empty object as data
    await api.post(`/profile/addresses/${id}/set-default`, {});
    
    setAddresses(addresses.map(addr => ({
      ...addr,
      is_default: addr.id === id
    })));
    setMessage({ type: 'success', text: 'Default address updated!' });
  } catch (error: any) {
    setMessage({ type: 'error', text: error.message || 'Failed to set default address' });
  } finally {
    setSaving(false);
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

  if (!user) return null;

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-emerald-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
            <p className="text-violet-100">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(['account', 'addresses', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium capitalize transition-colors duration-300 ${
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

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={editingUser?.name || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editingUser?.bio || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, bio: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveAccount}
                disabled={saving}
                className="px-6"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {/* Password Change */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={password.current}
                    onChange={(e) => setPassword(prev => ({ ...prev, current: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={password.new}
                    onChange={(e) => setPassword(prev => ({ ...prev, new: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={password.confirm}
                    onChange={(e) => setPassword(prev => ({ ...prev, confirm: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleChangePassword}
                  variant="outline"
                  disabled={saving}
                  className="px-6"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Saved Addresses</h2>
              <Button
                onClick={() => setEditingAddress(null)}
                className="px-4 py-2"
              >
                Add New Address
              </Button>
            </div>

            {/* New Address Form */}
            {!editingAddress && (
              <div className="mb-8 p-6 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">
                  Add New Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  />
                  <Input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  />
                  <Input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                  />
                  <Input
                    type="text"
                    placeholder="ZIP Code"
                    value={newAddress.postal_code}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                  />
                  <select
                    value={newAddress.country}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleSaveAddress}
                    disabled={saving}
                    className="px-6"
                  >
                    {saving ? 'Adding...' : 'Add Address'}
                  </Button>
                </div>
              </div>
            )}

            {/* Edit Address Form */}
            {editingAddress && (
              <div className="mb-8 p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">
                  Edit Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Street Address"
                    value={editingAddress.street}
                    onChange={(e) => setEditingAddress(prev => 
                        prev ? { ...prev, street: e.target.value } : null
                    )}
                  />
                  <Input
                    type="text"
                    placeholder="City"
                    value={editingAddress.city}
                    onChange={(e) => setEditingAddress(prev => 
                        prev ? { ...prev, city: e.target.value } : null
                    )}
                  />
                  <Input
                    type="text"
                    placeholder="State"
                    value={editingAddress.state}
                    onChange={(e) => setEditingAddress(prev => 
                        prev ? { ...prev, state: e.target.value } : null
                    )}
                  />
                  <Input
                    type="text"
                    placeholder="ZIP Code"
                    value={editingAddress.postal_code}
                    onChange={(e) => setEditingAddress(prev => 
                        prev ? { ...prev, postal_code: e.target.value } : null
                    )}
                  />
                  <select
                    value={editingAddress.country}
                    onChange={(e) => setEditingAddress(prev => 
                        prev ? { ...prev, country: e.target.value } : null
                    )}
                    className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={handleUpdateAddress}
                    disabled={saving}
                    className="px-6"
                  >
                    {saving ? 'Updating...' : 'Update Address'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingAddress(null)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Saved Addresses */}
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {address.street}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {address.city}, {address.state} {address.postal_code}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {address.country}
                      </div>
                      {address.is_default && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          disabled={saving}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAddress(address)}
                      >
                        Edit
                      </Button>
                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={saving}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Order History</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  No orders yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Start shopping to see your order history here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div>
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                          Order #{order.id}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        Items:
                      </div>
                      <div className="mt-2 space-y-1">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="text-slate-600 dark:text-slate-400">
                            {item.itemable.name} × {item.quantity}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-slate-600 dark:text-slate-400">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-xl font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </div>
                      <Link to={`/orders/${order.id}`} className="text-primary hover:underline">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};