import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pathpilot_student_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('pathpilot_student_token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Auto hide toast after 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  // Verify and refresh session on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('pathpilot_student_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('pathpilot_student_token', userToken);
        localStorage.setItem('pathpilot_student_user', JSON.stringify(userData));
        showToast('Welcome back, ' + userData.name + '!', 'success');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials or server unavailable';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('pathpilot_student_token', userToken);
        localStorage.setItem('pathpilot_student_user', JSON.stringify(userData));
        showToast('Student account created successfully!', 'success');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration error';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await api.put('/auth/profile', updates);
      if (res.data?.success) {
        setUser(res.data.data);
        localStorage.setItem('pathpilot_student_user', JSON.stringify(res.data.data));
        showToast('Profile & preferences updated successfully', 'success');
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update profile';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      setUser(null);
      setToken(null);
      localStorage.removeItem('pathpilot_student_token');
      localStorage.removeItem('pathpilot_student_user');
      showToast('Account permanently deleted as per GDPR/CCPA guidelines.', 'info');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not delete account';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pathpilot_student_token');
    localStorage.removeItem('pathpilot_student_user');
    showToast('Logged out securely.', 'info');
  };

  const currency = user?.currency || '$';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        currency,
        toast,
        showToast,
        setToast,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
