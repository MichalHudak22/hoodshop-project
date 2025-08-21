import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  // Inicializácia sessionId
  useEffect(() => {
    let sId = localStorage.getItem('sessionId') || localStorage.getItem('session_id');
    if (!sId) {
      sId = crypto.randomUUID();
      localStorage.setItem('sessionId', sId);
    }
    setSessionId(sId);
  }, []);

  const fetchCartCount = useCallback(async () => {
    if (!sessionId && !user) return;

    try {
      const headers = {};
      const token = user?.token || localStorage.getItem('token');

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart/count`, { headers });
      setCartCount(res.data?.count || 0);
    } catch (err) {
      console.error('Chyba pri načítaní počtu položiek v košíku:', err);
      setCartCount(0);
    }
  }, [sessionId, user]);

  useEffect(() => {
    fetchCartCount();
  }, [user, sessionId, fetchCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount: fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
