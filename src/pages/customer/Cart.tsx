import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { CartItem } from '../../components/customer/CartItem';
import { useToast } from '../../hooks/useToast';
// eslint-disable-next-line react-hooks/rules-of-hooks
const toast = useToast();

// Define TypeScript interfaces
interface CartItem {
  id: number;
  quantity: number;
  unit_price: number;
  total: number;
  itemable: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    type: string;
  };
  customization?: {
    engraving_text?: string;
  };
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}


export const Cart: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Fetch cart data
  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      const cartData = response.data || response;
      
      // Calculate totals if not provided by backend
      if (!cartData.subtotal) {
        const subtotal = cartData.items.reduce((sum: number, item: CartItem) => sum + item.total, 0);
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;
        setCart({ ...cartData, subtotal, tax, total });
      } else {
        setCart(cartData);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart({ items: [], subtotal: 0, tax: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update item quantity
  const updateQuantity = async (itemId: number, newQuantity: number) => {
  if (newQuantity < 1) return;
  
  try {
    await api.put(`/cart/${itemId}`, { quantity: newQuantity });
    fetchCart(); // Refresh cart
    
    // ✅ Correct usage: call useToast() inside the component, then use it
    showToast('Item Quantity Updated', `Quantity updated to ${newQuantity}`, 'success');
  } catch (error) {
    console.error('Failed to update quantity:', error);
    showToast('Update Failed', 'Could not update quantity', 'error');
  }
};

  // Remove item from cart
  const removeItem = async (itemId: number) => {
  try {
    await api.del(`/cart/${itemId}`);
    fetchCart(); // Refresh cart
    showToast('Item Removed', 'Item removed from cart', 'success');
  } catch (error) {
    console.error('Failed to remove item:', error);
    showToast('Removal Failed', 'Could not remove item', 'error');
  }
};

  // Apply promo code
  const applyPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    try {
      const response = await api.post('/discounts/validate', { code: promoCode });
      
      if (response.valid) {
        setPromoApplied(true);
        setPromoSuccess(`Applied! ${response.discount_amount} off`);
        // In a real app, you'd update cart totals with discount
        fetchCart();
      } else {
        setPromoError(response.message || 'Invalid promo code');
      }
    } catch (error: any) {
      setPromoError(error.message || 'Failed to apply promo code');
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="bg-slate-200 dark:bg-slate-700 h-8 w-64 rounded mb-6"></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-32 w-full max-w-4xl rounded-lg mb-4"></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-32 w-full max-w-4xl rounded-lg mb-4"></div>
          <div className="bg-slate-200 dark:bg-slate-700 h-48 w-full max-w-md rounded-lg"></div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-emerald-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Your Shopping Cart</h1>
            <p className="text-xl text-violet-100">
              {isEmpty ? 'Your cart is empty' : `${cart.items.length} item${cart.items.length !== 1 ? 's' : ''} ready for checkout`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          // Empty Cart State
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              Your cart is empty
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              You haven't added any items to your cart yet. Start shopping to find unique creations!
            </p>
            <Link to="/products">
              Browse Products
            </Link>
          </div>
        ) : (
          // Cart Content
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.itemable.image_url || 'https://placehold.co/150x150/e2e8f0/64748b?text=Product'}
                          alt={item.itemable.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1">
                              {item.itemable.name}
                            </h3>
                            {item.customization?.engraving_text && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Engraving: "{item.customization.engraving_text}"
                              </p>
                            )}
                            <p className="text-primary font-bold">
                              ${item.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-start sm:items-end mt-2 sm:mt-0">
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                              ${item.total.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 text-slate-800 dark:text-slate-200 min-w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Have a promo code?</h3>
                <form onSubmit={applyPromoCode} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-grow bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="submit" variant="outline">
                    Apply
                  </Button>
                </form>
                {promoError && <p className="mt-2 text-sm text-red-500">{promoError}</p>}
                {promoSuccess && <p className="mt-2 text-sm text-emerald-500">{promoSuccess}</p>}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Discount</span>
                    <span className="font-medium text-emerald-500">-$10.00</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Tax</span>
                  <span className="font-medium">${cart.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Total</span>
                  <span className="text-lg font-bold text-primary">${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full py-3 text-lg"
              >
                Proceed to Checkout
              </Button>

              <div className="mt-4 text-center">
                <Link to="/products" className="text-slate-600 dark:text-slate-400 hover:text-primary">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};