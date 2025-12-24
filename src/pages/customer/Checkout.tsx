import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';

// Define TypeScript interfaces
interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

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
  };
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export const Checkout: React.FC = () => {
  const [activeStep, setActiveStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();

  // Shipping Form State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardErrors, setCardErrors] = useState('');

  // Fetch cart and addresses
  const fetchCheckoutData = async () => {
    try {
      const [cartResponse, addressResponse] = await Promise.all([
        api.get('/cart'),
        api.get('/profile/addresses')
      ]);

      const cartData = cartResponse.data || cartResponse;
      const addressData = Array.isArray(addressResponse) ? addressResponse : addressResponse.data || [];

      // Calculate totals if not provided
      if (!cartData.subtotal) {
        const subtotal = cartData.items.reduce((sum: number, item: CartItem) => sum + item.total, 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        setCart({ ...cartData, subtotal, tax, total });
      } else {
        setCart(cartData);
      }

      setAddresses(addressData);
      if (addressData.length > 0) {
        setSelectedAddress(addressData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch checkout data:', error);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!cart) return;

    setIsProcessing(true);
    try {
      // Prepare order data
      const orderData: any = {
        billing_address: useNewAddress ? newAddress : addresses.find(a => a.id === selectedAddress),
        shipping_address: useNewAddress ? newAddress : addresses.find(a => a.id === selectedAddress),
        payment_method: paymentMethod,
      };

      // If using existing address, send ID instead of full object
      if (!useNewAddress && selectedAddress) {
        orderData.billing_address_id = selectedAddress;
        orderData.shipping_address_id = selectedAddress;
        delete orderData.billing_address;
        delete orderData.shipping_address;
      }

      // Place order
      const response = await api.post('/checkout', orderData);
      
      if (response.id) {
        setOrderPlaced(true);
        // In a real app, you'd redirect to order confirmation page
        setTimeout(() => navigate('/orders'), 3000);
      }
    } catch (error: any) {
      console.error('Failed to place order:', error);
      setCardErrors(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
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

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your order has been confirmed. You'll receive a confirmation email shortly.
          </p>
          <Link to="/orders" className="w-full">
            View Order Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            {(['shipping', 'payment', 'review'] as const).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeStep === step 
                    ? 'bg-primary text-white' 
                    : ['shipping', 'payment', 'review'].indexOf(activeStep) > index
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {['shipping', 'payment', 'review'].indexOf(activeStep) > index ? '✓' : index + 1}
                </div>
                <span className="ml-2 font-medium capitalize text-slate-700 dark:text-slate-300">
                  {step}
                </span>
                {index < 2 && <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            {activeStep === 'shipping' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Shipping Address</h2>
                
                {addresses.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Select an address
                    </label>
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-start">
                          <input
                            type="radio"
                            id={`address-${address.id}`}
                            name="address"
                            checked={selectedAddress === address.id && !useNewAddress}
                            onChange={() => {
                              setSelectedAddress(address.id);
                              setUseNewAddress(false);
                            }}
                            className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`address-${address.id}`} className="ml-3 text-slate-700 dark:text-slate-300">
                            <div className="font-medium">{address.street}</div>
                            <div>{address.city}, {address.state} {address.postal_code}</div>
                            <div>{address.country}</div>
                            {address.is_default && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="address"
                          checked={useNewAddress}
                          onChange={() => setUseNewAddress(true)}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span className="ml-3 text-slate-700 dark:text-slate-300">Use a new address</span>
                      </label>
                    </div>
                  </div>
                )}

                {(useNewAddress || addresses.length === 0) && (
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Street Address"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setActiveStep('payment')}
                    disabled={!selectedAddress && !useNewAddress}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {activeStep === 'payment' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Payment Method</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="payment-card"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="payment-card" className="ml-3 text-slate-700 dark:text-slate-300">
                      Credit/Debit Card
                    </label>
                  </div>
                  
                  {/* Stripe Elements would go here in a real implementation */}
                  <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">•••• •••• •••• 4242</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-5 bg-red-500 rounded-sm"></div>
                        <div className="w-8 h-5 bg-yellow-500 rounded-sm"></div>
                        <div className="w-8 h-5 bg-green-500 rounded-sm"></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Input type="text" placeholder="Cardholder Name" />
                      <Input type="text" placeholder="MM/YY" className="mt-3 inline-block w-24 mr-2" />
                      <Input type="text" placeholder="CVC" className="mt-3 inline-block w-24" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="payment-paypal"
                      name="payment"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="payment-paypal" className="ml-3 text-slate-700 dark:text-slate-300">
                      PayPal
                    </label>
                  </div>
                </div>

                {cardErrors && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {cardErrors}
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep('shipping')}
                  >
                    Back to Shipping
                  </Button>
                  <Button
                    onClick={() => setActiveStep('review')}
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {activeStep === 'review' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Review Order</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Shipping Address</h3>
                    {useNewAddress ? (
                      <div className="text-slate-800 dark:text-slate-200">
                        <div>{newAddress.street}</div>
                        <div>{newAddress.city}, {newAddress.state} {newAddress.postal_code}</div>
                        <div>{newAddress.country}</div>
                      </div>
                    ) : (
                      addresses.find(a => a.id === selectedAddress) && (
                        <div className="text-slate-800 dark:text-slate-200">
                          <div>{addresses.find(a => a.id === selectedAddress)?.street}</div>
                          <div>{addresses.find(a => a.id === selectedAddress)?.city}, {addresses.find(a => a.id === selectedAddress)?.state} {addresses.find(a => a.id === selectedAddress)?.postal_code}</div>
                          <div>{addresses.find(a => a.id === selectedAddress)?.country}</div>
                        </div>
                      )
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Payment Method</h3>
                    <div className="text-slate-800 dark:text-slate-200">
                      {paymentMethod === 'card' ? 'Credit/Debit Card ending in 4242' : 'PayPal'}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep('payment')}
                  >
                    Back to Payment
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="px-8"
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Placing Order...
                      </span>
                    ) : 'Place Order'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200">{item.itemable.name}</span>
                    <span className="text-slate-600 dark:text-slate-400 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Tax</span>
                <span className="font-medium">${cart.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Total</span>
                <span className="text-lg font-bold text-primary">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            {activeStep === 'review' && (
              <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
                By placing your order, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' and '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};