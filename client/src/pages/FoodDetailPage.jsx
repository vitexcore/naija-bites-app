import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.id === parseInt(id));

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/menu/${id}`);
        setItem(res.data.data.item);
      } catch (err) {
        setError('Failed to load dish details.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleAddToCart = () => {
    if (!item) return;
    addItem(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500 text-lg">{error || 'Dish not found.'}</p>
        <Link to="/menu" className="text-amber-600 font-medium hover:underline">← Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 mb-6">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <span>/</span>
          <Link to="/menu" className="hover:text-amber-600">Menu</Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">{item.name}</span>
        </nav>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="relative h-64 md:h-auto min-h-[300px]">
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80'}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80'; }}
              />
              {!item.is_available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-stone-800 font-semibold px-4 py-2 rounded-full">Currently Unavailable</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 sm:p-8 flex flex-col">
              <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
                {item.category_name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3">{item.name}</h1>
              <p className="text-stone-600 leading-relaxed mb-6 flex-1">
                {item.description || 'A delicious Nigerian dish prepared fresh with quality ingredients.'}
              </p>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-3xl font-bold text-amber-700">{formatPrice(item.price)}</span>
                {item.is_available ? (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Available</span>
                ) : (
                  <span className="bg-red-100 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">Unavailable</span>
                )}
              </div>

              {item.is_available && (
                <>
                  {/* Quantity */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-stone-600 font-medium text-sm">Quantity:</span>
                    <div className="flex items-center gap-0 border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors font-bold text-lg"
                      >−</button>
                      <span className="w-12 h-10 flex items-center justify-center text-stone-900 font-semibold border-x border-stone-200">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(qty + 1)}
                        className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors font-bold text-lg"
                      >+</button>
                    </div>
                    <span className="text-stone-500 text-sm">{formatPrice(parseFloat(item.price) * qty)}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                        added
                          ? 'bg-green-600 text-white'
                          : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95'
                      }`}
                    >
                      {added ? '✓ Added to Cart!' : 'Add to Cart'}
                    </button>
                    {inCart && (
                      <button
                        onClick={() => navigate('/cart')}
                        className="px-5 py-3.5 border-2 border-amber-600 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-colors"
                      >
                        View Cart
                      </button>
                    )}
                  </div>
                </>
              )}

              <Link to="/menu" className="mt-4 text-center text-stone-500 hover:text-amber-600 text-sm transition-colors">
                ← Back to Menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailPage;
