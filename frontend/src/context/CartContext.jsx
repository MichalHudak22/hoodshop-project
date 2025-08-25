import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    try {
      const headers = {};
      const token = user?.token || localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId') || localStorage.getItem('session_id');

      if (token) headers['Authorization'] = `Bearer ${token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });
      setCartItems(res.data);
      setCartCount(res.data.length);
    } catch (err) {
      console.error('Chyba pri načítaní košíka:', err);
      setCartItems([]);
      setCartCount(0);
    }
  };

  useEffect(() => {
    if (!loading) {
      // ak sa user zmenil (login/logout), fetchni košík
      let sId = localStorage.getItem('sessionId') || localStorage.getItem('session_id');
      if (!sId) {
        sId = uuidv4();
        localStorage.setItem('sessionId', sId);
      }
      fetchCart();
    }
  }, [user, loading]);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
