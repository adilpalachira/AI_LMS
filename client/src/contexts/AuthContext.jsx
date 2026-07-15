import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          // Verify token is still valid with backend
          const response = await api.get('/users/profile');
          if (response.data.success) {
            setUser(response.data.data);
            localStorage.setItem('user', JSON.stringify(response.data.data));
          }
        } catch (err) {
          console.error('Session verification failed', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken, refreshToken } = response.data.data;

      setUser(userData);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setLoading(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (name, email, password, confirmPassword, phone, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
        phone,
        role,
      });
      const { user: userData, accessToken, refreshToken } = response.data.data;

      setUser(userData);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setLoading(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      const detailedErrors = err.response?.data?.errors;
      setError(msg);
      setLoading(false);
      return { success: false, error: msg, errors: detailedErrors };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API request failed, clearing local storage anyway.', err);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  // Update Profile handler
  const updateProfile = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedUser = response.data.data;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setLoading(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  // Change Password handler
  const changePassword = async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      await api.put('/users/change-password', { oldPassword, newPassword });
      setLoading(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
