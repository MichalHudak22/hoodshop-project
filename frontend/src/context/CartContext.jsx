import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // Zabezpečíme sessionId pri mount
  useEffect(() => {
    let sId = localStorage.getItem('sessionId');
    if (!sId) {
      sId = crypto.randomUUID();
      localStorage.setItem('sessionId', sId);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const headers = {};
      const sessionId = localStorage.getItem('sessionId');

      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else headers['x-session-id'] = sessionId;

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });

      setCartItems(res.data || []);
      setCartCount(res.data?.length || 0);
    } catch (err) {
      console.error('Chyba pri načítaní košíka:', err);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  const setCartDirectly = (items) => {
    setCartItems(items);
    setCartCount(items.length);
  };

  const refreshCart = useCallback(() => fetchCart(), [fetchCart]);

  // Fetch vždy po mount a pri zmene user, počkáme až user sa načíta
  useEffect(() => {
    const sessionReady = !!localStorage.getItem('sessionId');
    if (!sessionReady) return;

    // fetch len keď user je načítaný (pre login/logout)
    fetchCart();
  }, [fetchCart, user?.token]);

  return (
    <CartContext.Provider value={{ cartCount, cartItems, setCartDirectly, refreshCart, cartLoading }}>
      {children}
    </CartContext.Provider>
  );
};
