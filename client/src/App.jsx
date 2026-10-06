import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import FoodDetailPage from './pages/FoodDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public + Customer routes inside MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:id" element={<FoodDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected customer routes */}
            <Route path="/checkout" element={
              <ProtectedRoute><CheckoutPage /></ProtectedRoute>
            } />
            <Route path="/dashboard/*" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
          </Route>

          {/* Admin routes — no shared layout (has its own navbar) */}
          <Route path="/admin/*" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4 p-4">
              <div className="text-6xl">🍽️</div>
              <h1 className="text-3xl font-bold text-stone-900">Page Not Found</h1>
              <p className="text-stone-500">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-amber-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors">
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
