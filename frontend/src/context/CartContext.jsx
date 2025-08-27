import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  // fetch cart count pre aktuálneho používateľa alebo session
  const fetchCartCount = useCallback(async () => {
    try {
      const headers = {};
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('session_id') || localStorage.getItem('sessionId');

      if (user?.token || token) {
        headers['Authorization'] = `Bearer ${user?.token || token}`;
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

  // priamo nastaviť košík
  const setCartDirectly = (count) => {
    setCartCount(count);
  };

  // refresh funkcia
  const refreshCartCount = useCallback(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // len inicialny fetch pri mount a potom vždy, keď sa user zmení
  useEffect(() => {
    fetchCartCount();
  }, []); // ⚠️ odstraňujeme [user], aby sa nepremenil na session kosik po prihlásení

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount, setCartDirectly }}>
      {children}
    </CartContext.Provider>
  );
};
