import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import LoadingSpinner from '../components/LoadingSpinner';

const TESTIMONIALS = [
  { name: 'Adaeze O.', text: 'The jollof rice is absolutely divine — exactly like my mother used to make. Fast delivery too!', rating: 5, avatar: 'A' },
  { name: 'Emeka N.', text: 'Best suya in Lagos! The egusi soup is rich and perfectly seasoned. This is my go-to spot.', rating: 5, avatar: 'E' },
  { name: 'Fatima K.', text: 'I ordered the pounded yam and egusi combo — it arrived hot and fresh. Naija Bites never disappoints!', rating: 5, avatar: 'F' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', title: 'Browse Our Menu', desc: 'Explore a wide selection of authentic Nigerian dishes — from jollof rice to egusi soup and suya.' },
  { step: '02', icon: '🛒', title: 'Add to Cart', desc: 'Choose your favourites, select quantities, and build your perfect Nigerian meal order.' },
  { step: '03', icon: '📦', title: 'Place Your Order', desc: 'Checkout securely, confirm your delivery address, and we\'ll handle the rest.' },
  { step: '04', icon: '🚀', title: 'Fast Delivery', desc: 'Your hot, fresh Nigerian food is on its way to you in no time at all.' },
];

const WHY_US = [
  { icon: '🌿', title: 'Fresh Ingredients', desc: 'We source only the freshest Nigerian produce and spices for every dish.' },
  { icon: '👨‍🍳', title: 'Expert Chefs', desc: 'Prepared by experienced Nigerian chefs who bring decades of culinary expertise.' },
  { icon: '⚡', title: 'Fast Delivery', desc: 'Hot food delivered to your door within the hour, every time.' },
  { icon: '❤️', title: 'Made with Love', desc: 'Every dish is crafted with the warmth and care of Nigerian hospitality.' },
];

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          api.get('/menu?available=true'),
          api.get('/categories'),
        ]);
        // Take first 6 items as featured
        setFeaturedItems(menuRes.data.data.items.slice(0, 6));
        setCategories(catRes.data.data.categories.slice(0, 7));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1400&q=80"
            alt="Nigerian food"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-amber-400 text-sm font-medium">🍽️ Authentic Nigerian Cuisine</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              The Taste of <span className="text-amber-500">Nigeria</span>, Delivered to You
            </h1>
            <p className="text-stone-300 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
              Discover rich, flavourful Nigerian dishes prepared with love and tradition. 
              From smoky jollof rice to hearty egusi soup — real food, real flavour.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                Order Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                Explore Menu
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-white font-bold text-2xl">500+</div>
                <div className="text-stone-400 text-sm">Happy Customers</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-2xl">30+</div>
                <div className="text-stone-400 text-sm">Dishes Available</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-2xl">4.9★</div>
                <div className="text-stone-400 text-sm">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">Explore Our Categories</h2>
            <p className="text-stone-500">Browse through our carefully curated Nigerian food categories</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/menu?category=${cat.id}`}
                className="flex items-center gap-2 bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-stone-700 hover:text-amber-700 font-medium px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <span className="text-lg">
                  {cat.name.includes('Rice') ? '🍚' :
                   cat.name.includes('Soup') ? '🍲' :
                   cat.name.includes('Swallow') ? '🫓' :
                   cat.name.includes('Protein') ? '🍗' :
                   cat.name.includes('Breakfast') ? '🍳' :
                   cat.name.includes('Drink') ? '🥤' : '🍘'}
                </span>
                <span>{cat.name}</span>
                <span className="text-stone-400 text-sm group-hover:text-amber-500">({cat.item_count})</span>
              </Link>
            ))}
            <Link
              to="/menu"
              className="flex items-center gap-2 bg-amber-600 text-white font-medium px-5 py-2.5 rounded-full hover:bg-amber-700 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-amber-600 font-medium text-sm">OUR SPECIALTIES</span>
              <h2 className="text-3xl font-bold text-stone-900 mt-1">Featured Dishes</h2>
            </div>
            <Link to="/menu" className="text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1">
              View full menu →
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-amber-500 font-medium text-sm">WHY NAIJA BITES?</span>
            <h2 className="text-3xl font-bold mt-2">Quality You Can Taste</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl bg-stone-800 hover:bg-stone-700 transition-colors">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-medium text-sm">SIMPLE & EASY</span>
            <h2 className="text-3xl font-bold text-stone-900 mt-2">How Ordering Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-amber-300 z-0" style={{ width: 'calc(100% - 4rem)', left: '60%' }} />
                )}
                <div className="relative z-10 w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md">
                  {step.icon}
                </div>
                <div className="text-amber-600 font-bold text-xs mb-1">{step.step}</div>
                <h3 className="font-semibold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-medium text-sm">CUSTOMER LOVE</span>
            <h2 className="text-3xl font-bold text-stone-900 mt-2">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-stone-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex text-amber-500 mb-3">
                  {'★'.repeat(t.rating)}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <span className="font-medium text-stone-800">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Real Nigerian Flavour?</h2>
          <p className="text-amber-100 text-lg mb-8">
            Join thousands of happy customers ordering authentic Nigerian food daily.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="bg-white text-amber-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-amber-50 transition-colors"
            >
              Order Now
            </Link>
            <Link
              to="/register"
              className="bg-amber-800/30 text-white border border-white/40 font-semibold px-8 py-3.5 rounded-xl hover:bg-amber-800/50 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
