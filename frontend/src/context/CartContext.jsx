import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

// Inicializácia session_id
const initSession = () => {
  if (!localStorage.getItem('session_id')) {
    const newId = crypto.randomUUID();
    localStorage.setItem('session_id', newId);
    console.log('New session_id created:', newId);  // <-- kontrola
  } else {
    console.log('Existing session_id:', localStorage.getItem('session_id')); // <-- kontrola
  }
};

// fetchCartCount
const fetchCartCount = useCallback(async () => {
  try {
    const headers = {};
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem('session_id');
    console.log('Fetching cart count. Token:', token, 'SessionID:', sessionId); // <-- kontrola

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (sessionId) {
      headers['x-session-id'] = sessionId;
    }

    const res = await axios.get('/api/cart/count', { headers });
    console.log('Cart count response:', res.data); // <-- kontrola
    setCartCount(res.data.count || 0);
  } catch (err) {
    console.error('Chyba pri načítaní počtu položiek v košíku:', err);
    setCartCount(0);
  }
}, []);


  // Stabilná referencia pre aktualizáciu počtu
  const refreshCartCount = useCallback(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  useEffect(() => {
    // Inicializácia session_id pred načítaním počtu
    initSession();
    fetchCartCount();
  }, [user]); // spustí sa pri štarte a pri zmene user (login/logout)

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
