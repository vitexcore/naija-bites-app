import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getStatusColor, getStatusLabel, getErrorMessage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const VALID_STATUSES = ['pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'];

// ── Stats Cards ──────────────────────────────────────────────────────────────
const StatsSection = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {[
      { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'text-amber-700' },
      { label: 'Customers', value: stats.totalCustomers, icon: '👥', color: 'text-blue-700' },
      { label: 'Menu Items', value: `${stats.availableMenuItems}/${stats.totalMenuItems}`, icon: '🍽️', color: 'text-green-700' },
      { label: 'Revenue', value: formatPrice(stats.totalRevenue || 0), icon: '💰', color: 'text-purple-700' },
    ].map((s) => (
      <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="text-3xl mb-2">{s.icon}</div>
        <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
        <div className="text-stone-500 text-xs mt-1">{s.label}</div>
      </div>
    ))}
  </div>
);

// ── Menu Management ───────────────────────────────────────────────────────────
const MenuManager = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | {item}
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ category_id: '', name: '', description: '', price: '', image_url: '', is_available: true });

  const fetchAll = async () => {
    setLoading(true);
    const [menuRes, catRes] = await Promise.all([api.get('/menu'), api.get('/categories')]);
    setItems(menuRes.data.data.items);
    setCategories(catRes.data.data.categories);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setForm({ category_id: categories[0]?.id || '', name: '', description: '', price: '', image_url: '', is_available: true });
    setFormError('');
    setModal('create');
  };

  const openEdit = (item) => {
    setForm({ category_id: item.category_id, name: item.name, description: item.description || '', price: item.price, image_url: item.image_url || '', is_available: item.is_available });
    setFormError('');
    setModal(item);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = { ...form, price: parseFloat(form.price), category_id: parseInt(form.category_id) };
      if (modal === 'create') {
        await api.post('/menu', payload);
      } else {
        await api.put(`/menu/${modal.id}`, payload);
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      setDeleteConfirm(null);
      fetchAll();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await api.put(`/menu/${item.id}`, { is_available: !item.is_available });
      fetchAll();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-stone-900">Menu Items ({items.length})</h2>
        <button onClick={openCreate} className="bg-amber-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors text-sm">
          + Add Item
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Item</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Price</th>
                <th className="text-center px-4 py-3 font-semibold text-stone-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        <img src={item.image_url || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=80'} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=80'; }} />
                      </div>
                      <span className="font-medium text-stone-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{item.category_name}</td>
                  <td className="px-4 py-3 text-right font-medium text-amber-700">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleAvailability(item)} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${item.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-700 font-medium text-xs px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
                      <button onClick={() => setDeleteConfirm(item.id)} className="text-red-500 hover:text-red-600 font-medium text-xs px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6">
              <h3 className="text-lg font-bold text-stone-900 mb-4">{modal === 'create' ? 'Add New Item' : `Edit — ${modal.name}`}</h3>
              {formError && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl mb-4">{formError}</div>}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Price (₦) *</label>
                  <input type="number" min="0" step="50" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Image URL</label>
                  <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm text-stone-700 font-medium">Available for ordering</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-amber-600 text-white font-semibold py-3 rounded-xl hover:bg-amber-700 transition-colors">
                    {modal === 'create' ? 'Add Item' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setModal(null)} className="flex-1 border border-stone-200 text-stone-600 font-semibold py-3 rounded-xl hover:bg-stone-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Delete Menu Item?</h3>
            <p className="text-stone-500 text-sm mb-5">This action cannot be undone. Items that exist in orders cannot be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-stone-200 text-stone-600 font-semibold py-2.5 rounded-xl hover:bg-stone-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Order Management ──────────────────────────────────────────────────────────
const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/orders/admin/all${params}`);
      setOrders(res.data.data.orders);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const openDetail = async (orderId) => {
    try {
      const res = await api.get(`/orders/admin/${orderId}`);
      setSelectedOrder(res.data.data.order);
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-stone-900 flex-1">Orders</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">All Statuses</option>
          {VALID_STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Customer</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Total</th>
                <th className="text-center px-4 py-3 font-semibold text-stone-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">#{order.id}</p>
                    <p className="text-stone-400 text-xs">{formatDate(order.created_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-stone-700">{order.customer_name}</p>
                    <p className="text-stone-400 text-xs">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-amber-700">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openDetail(order.id)} className="text-blue-600 hover:text-blue-700 font-medium text-xs px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-10 text-stone-400">No orders found.</div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Order #{selectedOrder.id}</h3>
                  <p className="text-stone-500 text-sm">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-600 p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-stone-50 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-stone-700 mb-2">Customer</p>
                  <p className="text-stone-600">{selectedOrder.customer_name}</p>
                  <p className="text-stone-500">{selectedOrder.customer_email}</p>
                  <p className="text-stone-500">{selectedOrder.customer_phone}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-stone-700 mb-2">Delivery Address</p>
                  <p className="text-stone-600">{selectedOrder.delivery_address}</p>
                  {selectedOrder.notes && <p className="text-stone-500 mt-1 italic">"{selectedOrder.notes}"</p>}
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 mb-4">
                <p className="font-semibold text-stone-700 text-sm mb-3">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-stone-700">{item.menu_item_name} × {item.quantity}</span>
                      <span className="text-stone-600 font-medium">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-200 mt-3 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between text-stone-500"><span>Delivery</span><span>{formatPrice(selectedOrder.delivery_fee)}</span></div>
                  <div className="flex justify-between font-bold text-stone-900"><span>Total</span><span className="text-amber-700">{formatPrice(selectedOrder.total)}</span></div>
                </div>
              </div>

              <div>
                <p className="font-semibold text-stone-700 text-sm mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {VALID_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedOrder.status === s ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                      {getStatusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Category Manager ──────────────────────────────────────────────────────────
const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const fetch = async () => {
    setLoading(true);
    const res = await api.get('/categories');
    setCategories(res.data.data.categories);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
        setEditing(null);
      } else {
        await api.post('/categories', form);
      }
      setForm({ name: '', description: '' });
      fetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? This will fail if items exist in it.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetch();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-bold text-stone-900 mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl mb-4">{error}</div>}
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 text-stone-900 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-amber-600 text-white font-semibold py-3 rounded-xl hover:bg-amber-700 transition-colors">
              {editing ? 'Save Changes' : 'Add Category'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); }} className="flex-1 border border-stone-200 text-stone-600 font-semibold py-3 rounded-xl hover:bg-stone-50 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-bold text-stone-900 mb-4">All Categories</h2>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-800">{cat.name}</p>
                <p className="text-stone-400 text-xs">{cat.item_count} items</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '' }); }} className="text-blue-600 hover:text-blue-700 font-medium text-xs px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
                <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-600 font-medium text-xs px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Page ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/orders/admin/stats');
        setStats(res.data.data);
      } catch {}
      finally { setStatsLoading(false); }
    };
    fetchStats();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    { id: 'menu', label: 'Menu' },
    { id: 'categories', label: 'Categories' },
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Admin Navbar */}
      <header className="bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-sm">N</span>
            </div>
            <span className="font-bold">Naija Bites <span className="text-amber-500 text-sm font-normal ml-1">Admin</span></span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-stone-400 hidden sm:block">{user?.name}</span>
            <Link to="/" className="text-stone-400 hover:text-white transition-colors">View Site</Link>
            <button onClick={handleLogout} className="text-stone-400 hover:text-red-400 transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500 text-sm">Manage your restaurant from here.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl mb-6 shadow-sm overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          statsLoading ? <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div> : (
            <>
              <StatsSection stats={stats} />
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900 mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {(stats.recentOrders || []).slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                      <div>
                        <p className="font-medium text-stone-800 text-sm">Order #{order.id} — {order.customer_name}</p>
                        <p className="text-stone-400 text-xs">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                        <p className="text-amber-700 font-bold text-sm mt-1">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  ))}
                  {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                    <p className="text-stone-400 text-sm text-center py-4">No orders yet.</p>
                  )}
                </div>
              </div>
            </>
          )
        )}
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'menu' && <MenuManager />}
        {activeTab === 'categories' && <CategoryManager />}
      </div>
    </div>
  );
};

export default AdminDashboard;
