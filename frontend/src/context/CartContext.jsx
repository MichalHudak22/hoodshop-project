// CartContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const headers = {};
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('session_id') || localStorage.getItem('sessionId');

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/count`,
        { headers }
      );

      setCartCount(res.data.count || 0);
    } catch (err) {
      console.error('Chyba pri načítaní počtu položiek v košíku:', err);
      setCartCount(0);
    }
  };

  // 🟢 refresh pri zmene user (login/logout)
  useEffect(() => {
    fetchCartCount();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount: fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
