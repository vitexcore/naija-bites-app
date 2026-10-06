import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice, getErrorMessage } from '../utils/helpers';

const DELIVERY_FEE = 500;

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    delivery_name: user?.name || '',
    delivery_phone: user?.phone || '',
    delivery_address: user?.address || '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = subtotal + DELIVERY_FEE;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.delivery_address.trim()) {
      setError('Delivery address is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
        delivery_address: form.delivery_address,
        delivery_name: form.delivery_name,
        delivery_phone: form.delivery_phone,
        notes: form.notes,
      };
      const res = await api.post('/orders', orderPayload);
      clearCart();
      navigate(`/dashboard/orders/${res.data.data.order.id}`, {
        state: { successMessage: 'Your order has been placed successfully! 🎉' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4 p-4">
        <div className="text-5xl">🛒</div>
        <h2 className="text-xl font-semibold text-stone-800">Your cart is empty</h2>
        <Link to="/menu" className="bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors font-medium">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Delivery Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900 mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="delivery_name"
                      value={form.delivery_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      name="delivery_phone"
                      value={form.delivery_phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Delivery Address *</label>
                    <textarea
                      name="delivery_address"
                      value={form.delivery_address}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Enter your full delivery address…"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Special Instructions <span className="text-stone-400">(Optional)</span></label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Any special requests or notes for the kitchen…"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment placeholder */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-stone-900 mb-2">Payment</h2>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-amber-200">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-medium text-stone-800">Pay on Delivery</p>
                    <p className="text-stone-500 text-sm">Cash or card accepted at your door</p>
                  </div>
                  <div className="ml-auto w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-stone-900 mb-4">Order Summary</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=80'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-stone-800 text-sm font-medium truncate">{item.name}</p>
                          <p className="text-stone-400 text-xs">× {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-stone-700 text-sm font-medium flex-shrink-0">
                        {formatPrice(parseFloat(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>Delivery Fee</span><span>{formatPrice(DELIVERY_FEE)}</span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold text-base pt-2 border-t border-stone-100">
                    <span>Total</span><span className="text-amber-700">{formatPrice(total)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-5 bg-amber-600 text-white font-semibold py-3.5 rounded-xl hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
                >
                  {loading ? 'Placing Order…' : `Place Order · ${formatPrice(total)}`}
                </button>
                <Link to="/cart" className="block text-center text-stone-400 hover:text-stone-600 text-sm mt-3 transition-colors">
                  ← Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
