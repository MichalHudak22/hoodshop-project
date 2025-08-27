import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // SessionId pri mount
  useEffect(() => {
    try {
      let sId = localStorage.getItem('sessionId');
      if (!sId) {
        sId = crypto.randomUUID();
        localStorage.setItem('sessionId', sId);
      }
    } catch (err) {
      console.error('Chyba pri generovaní sessionId:', err);
    }
  }, []);

  // Fetch košíka
  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const headers = {};
      const sessionId = localStorage.getItem('sessionId');
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else headers['x-session-id'] = sessionId;

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });
      const items = res.data || [];
      setCartItems(items);

      const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (err) {
      console.error('Chyba pri načítaní košíka:', err);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }, [user?.token]);

  const setCartDirectly = (items) => {
    setCartItems(items);
    const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
    setCartCount(count);
  };

  // Fetch košíka pri mount a pri zmene user (login/logout)
  useEffect(() => {
    if (!localStorage.getItem('sessionId')) return;
    fetchCart();
  }, [fetchCart, user?.token]);

  return (
    <CartContext.Provider value={{ cartCount, cartItems, setCartDirectly, refreshCart: fetchCart, cartLoading }}>
      {children}
    </CartContext.Provider>
  );
};
