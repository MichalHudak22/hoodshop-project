import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://hoodshop-project.onrender.com';

  // Vytvorenie session_id pre neprihlásených
  const initSession = () => {
    if (!localStorage.getItem('session_id')) {
      const newSessionId = crypto.randomUUID();
      localStorage.setItem('session_id', newSessionId);
      console.log('Created new session_id:', newSessionId);
    } else {
      console.log('Existing session_id:', localStorage.getItem('session_id'));
    }
  };

  const fetchCartCount = useCallback(async () => {
    try {
      const headers = {};
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('session_id');

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      console.log('Fetching cart count. Token:', token, 'SessionID:', sessionId);

      const res = await axios.get(`${baseURL}/api/cart/count`, { headers });
      console.log('Cart count response:', res.data);

      setCartCount(res.data.count || 0);
    } catch (err) {
      console.error('Chyba pri načítaní počtu položiek v košíku:', err);
      setCartCount(0);
    }
  }, [baseURL]);

  const refreshCartCount = useCallback(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  useEffect(() => {
    initSession();
    fetchCartCount();
  }, [user, fetchCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
