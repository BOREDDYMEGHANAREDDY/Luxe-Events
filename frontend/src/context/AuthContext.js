import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Rehydrate from localStorage
  useEffect(() => {
    const token = localStorage.getItem('luxe_token');
    const user  = localStorage.getItem('luxe_user');
    if (token && user) {
      try {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user: JSON.parse(user) } });
      } catch {
        localStorage.removeItem('luxe_token');
        localStorage.removeItem('luxe_user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;
      localStorage.setItem('luxe_token', token);
      localStorage.setItem('luxe_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      toast.success(`Welcome back, ${user.firstName}!`);
      return { success: true, user };
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const res = await authAPI.register(data);
      const { token, user } = res.data;
      localStorage.setItem('luxe_token', token);
      localStorage.setItem('luxe_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      toast.success('Account created! Please verify your email.');
      return { success: true, user };
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('luxe_token');
    localStorage.removeItem('luxe_user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((userData) => {
    const updated = { ...state.user, ...userData };
    localStorage.setItem('luxe_user', JSON.stringify(updated));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }, [state.user]);

  const isAdmin = state.user?.role === 'admin' || state.user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
