import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import EmptyState from '../components/EmptyState';

const DELIVERY_FEE = 500;

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Looks like you haven't added any dishes yet. Explore our menu and discover amazing Nigerian food!"
          action={
            <Link to="/menu" className="bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-amber-700 transition-colors">
              Browse Menu
            </Link>
          }
        />
      </div>
    );
  }

  const total = subtotal + DELIVERY_FEE;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Your Cart <span className="text-stone-400 font-normal text-lg">({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
          </h1>
          <button onClick={clearCart} className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors">
            Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-base leading-tight">{item.name}</h3>
                      {item.category_name && <p className="text-stone-400 text-xs mt-0.5">{item.category_name}</p>}
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-stone-400 hover:text-red-500 transition-colors flex-shrink-0 p-1 -mr-1 -mt-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-0 border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold"
                      >−</button>
                      <span className="w-10 h-8 flex items-center justify-center text-stone-900 font-semibold text-sm border-x border-stone-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold"
                      >+</button>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-700">{formatPrice(parseFloat(item.price) * item.quantity)}</span>
                      <p className="text-stone-400 text-xs">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/menu" className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700 text-sm transition-colors mt-2">
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-stone-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-stone-600">
                    <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                    <span className="flex-shrink-0">{formatPrice(parseFloat(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600 text-sm">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold text-base pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span className="text-amber-700">{formatPrice(total)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-5 bg-amber-600 text-white font-semibold py-3.5 rounded-xl hover:bg-amber-700 active:scale-95 transition-all duration-200"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
              </button>
              {!isAuthenticated && (
                <p className="text-center text-stone-400 text-xs mt-2">You need to be signed in to place an order</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
