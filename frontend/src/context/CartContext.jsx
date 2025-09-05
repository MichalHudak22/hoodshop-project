import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  const BACKEND_URL = 'https://hoodshop-project.onrender.com';

  const fetchCartCount = useCallback(async () => {
    try {
      const headers = {};
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('session_id') || localStorage.getItem('sessionId');

      if (token) headers['Authorization'] = `Bearer ${token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      const res = await axios.get(`${BACKEND_URL}/api/cart/count`, { headers });
      setCartCount(res.data.count || 0);
    } catch (err) {
      console.error('Chyba pri načítaní počtu položiek v košíku:', err);
      setCartCount(0);
    }
  }, [user]); // <-- závislosť na user

  useEffect(() => {
    if (!user) {
      setCartCount(0);
    } else {
      fetchCartCount();
    }
  }, [user, fetchCartCount]);

  const refreshCartCount = useCallback(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
