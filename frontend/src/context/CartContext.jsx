import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const headers = {};

      if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/count`,
        { headers }
      );

      setCartCount(response.data.count || 0);
    } catch (err) {
      console.error('Failed to refresh cart count:', err);
    }
  };

  useEffect(() => {
    refreshCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
