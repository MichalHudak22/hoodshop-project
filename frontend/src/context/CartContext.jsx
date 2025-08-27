import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  // fetch cart count pre aktuálneho používateľa alebo session
  const fetchCartCount = useCallback(async (useToken = false) => {
    try {
      const headers = {};
      const sessionId = localStorage.getItem('sessionId');
      const token = localStorage.getItem('token');

      if (useToken && user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      } else if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart/count`, { headers });
      setCartCount(res.data.count || 0);
      console.log('🛒 Cart count fetched:', res.data.count);
    } catch (err) {
      console.error('Chyba pri načítaní počtu položiek v košíku:', err);
      setCartCount(0);
    }
  }, [user]);

  const setCartDirectly = (count) => setCartCount(count);
  const refreshCartCount = useCallback((useToken = false) => fetchCartCount(useToken), [fetchCartCount]);

  // Inicialny fetch pre session (guest)
  useEffect(() => {
    if (!user) fetchCartCount(false); // guest kosik
  }, [fetchCartCount, user]);

  // Fetch po prihlásení
  useEffect(() => {
    if (user?.token) fetchCartCount(true); // user kosik
  }, [user, fetchCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount, setCartDirectly }}>
      {children}
    </CartContext.Provider>
  );
};
