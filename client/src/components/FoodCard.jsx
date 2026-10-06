import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

const FoodCard = ({ item }) => {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.id === item.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item, 1);
  };

  return (
    <Link to={`/menu/${item.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-stone-100">
          <img
            src={item.image_url || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80'}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80';
            }}
          />
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-stone-800 text-xs font-semibold px-3 py-1 rounded-full">Unavailable</span>
            </div>
          )}
          {item.category_name && (
            <span className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {item.category_name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-stone-900 text-base mb-1 line-clamp-1 group-hover:text-amber-700 transition-colors">
            {item.name}
          </h3>
          <p className="text-stone-500 text-sm line-clamp-2 mb-3 leading-relaxed">
            {item.description || 'A delicious Nigerian dish prepared with the finest ingredients.'}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-amber-700 font-bold text-base">{formatPrice(item.price)}</span>
            {item.is_available ? (
              <button
                onClick={handleAddToCart}
                className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-200 ${
                  inCart
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95'
                }`}
              >
                {inCart ? `✓ In Cart (${inCart.quantity})` : 'Add to Cart'}
              </button>
            ) : (
              <span className="text-stone-400 text-sm">Sold out</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FoodCard;
