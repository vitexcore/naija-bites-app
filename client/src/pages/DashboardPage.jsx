import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams, Routes, Route } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getStatusColor, getStatusLabel, getErrorMessage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

// Order Detail Sub-page
const OrderDetail = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const successMessage = location.state?.successMessage;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data.data.order);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId]);

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (!order) return <p className="text-stone-500 text-center py-8">Order not found.</p>;

  return (
    <div>
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <span>🎉</span> {successMessage}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Order #{order.id}</h2>
          <p className="text-stone-500 text-sm">{formatDate(order.created_at)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-stone-800 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    <img src={item.menu_item_image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=80'} alt={item.menu_item_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-stone-800 text-sm font-medium">{item.menu_item_name}</p>
                    <p className="text-stone-400 text-xs">× {item.quantity} · {formatPrice(item.unit_price)} each</p>
                  </div>
                </div>
                <span className="text-stone-700 font-medium text-sm">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 mt-4 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-stone-600"><span>Delivery</span><span>{formatPrice(order.delivery_fee)}</span></div>
            <div className="flex justify-between font-bold text-stone-900 pt-1"><span>Total</span><span className="text-amber-700">{formatPrice(order.total)}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-stone-800 mb-4">Delivery Details</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-stone-500">Name:</span> <span className="text-stone-800 font-medium ml-1">{order.delivery_name}</span></div>
            <div><span className="text-stone-500">Phone:</span> <span className="text-stone-800 font-medium ml-1">{order.delivery_phone}</span></div>
            <div><span className="text-stone-500">Address:</span> <span className="text-stone-800 font-medium ml-1">{order.delivery_address}</span></div>
            {order.notes && <div><span className="text-stone-500">Notes:</span> <span className="text-stone-800 ml-1">{order.notes}</span></div>}
          </div>
        </div>
      </div>

      <Link to="/dashboard" className="mt-4 inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium">
        ← Back to Dashboard
      </Link>
    </div>
  );
};

// Orders List
const OrdersList = ({ orders, loading }) => {
  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (orders.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No orders yet"
        message="You haven't placed any orders yet. Start by browsing our menu!"
        action={<Link to="/menu" className="bg-amber-600 text-white px-6 py-2.5 rounded-xl hover:bg-amber-700 transition-colors font-medium">Browse Menu</Link>}
      />
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link key={order.id} to={`/dashboard/orders/${order.id}`} className="block">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">Order #{order.id}</p>
                <p className="text-stone-500 text-sm">{formatDate(order.created_at)}</p>
                <p className="text-stone-500 text-sm mt-1">{order.items?.length || 0} item(s)</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
                <p className="text-amber-700 font-bold mt-2">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

// Profile Section
const ProfileSection = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm max-w-md">
      <h2 className="text-lg font-bold text-stone-900 mb-4">My Profile</h2>
      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-xl mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
          <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-400 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Default Delivery Address</label>
          <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900 resize-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white font-semibold py-3 rounded-xl hover:bg-amber-700 disabled:opacity-60 transition-colors">
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

// Main Dashboard
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data.orders);
      } catch {
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if we're on a sub-route
  const isSubRoute = location.pathname !== '/dashboard';

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">My Dashboard</h1>
            <p className="text-stone-500">Welcome back, <span className="text-amber-700 font-medium">{user?.name?.split(' ')[0]}</span>!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/menu" className="text-sm font-medium text-amber-600 border border-amber-600 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors">
              Order Again
            </Link>
            <button onClick={handleLogout} className="text-sm font-medium text-stone-500 hover:text-red-600 transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        {!isSubRoute && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-amber-700">{orders.length}</div>
              <div className="text-stone-500 text-xs mt-1">Total Orders</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-green-700">{orders.filter(o => o.status === 'delivered').length}</div>
              <div className="text-stone-500 text-xs mt-1">Delivered</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-blue-700">{orders.filter(o => !['delivered','cancelled'].includes(o.status)).length}</div>
              <div className="text-stone-500 text-xs mt-1">Active</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-lg font-bold text-stone-700">{formatPrice(orders.filter(o => o.status === 'delivered').reduce((s, o) => s + parseFloat(o.total), 0))}</div>
              <div className="text-stone-500 text-xs mt-1">Total Spent</div>
            </div>
          </div>
        )}

        {/* Tabs (only on main dashboard) */}
        {!isSubRoute && (
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6 w-fit">
            {['orders', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                {tab === 'orders' ? 'My Orders' : 'Profile'}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <Routes>
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route
            path="*"
            element={
              activeTab === 'orders' ? (
                <OrdersList orders={orders} loading={loadingOrders} />
              ) : (
                <ProfileSection />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardPage;
