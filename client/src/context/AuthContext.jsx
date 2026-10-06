import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('naija_token');
    const storedUser = localStorage.getItem('naija_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token still valid
        api.get('/auth/me')
          .then((res) => setUser(res.data.data.user))
          .catch(() => logout())
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, token } = res.data.data;
    localStorage.setItem('naija_token', token);
    localStorage.setItem('naija_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    const { user: newUser, token } = res.data.data;
    localStorage.setItem('naija_token', token);
    localStorage.setItem('naija_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('naija_token');
    localStorage.removeItem('naija_user');
    setUser(null);
  }, []);

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('naija_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
