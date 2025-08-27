import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const headers = {};
      const sessionId = localStorage.getItem('sessionId');

      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });

      setCartItems(res.data || []);
      setCartCount(res.data?.length || 0);
      console.log('🛒 Cart fetched:', res.data);
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

  // fetch košíka vždy pri mount a pri zmene user
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cartCount, cartItems, setCartDirectly, refreshCart, cartLoading }}>
      {children}
    </CartContext.Provider>
  );
};
