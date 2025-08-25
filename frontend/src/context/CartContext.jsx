// CartContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  // inicializácia sessionId
  useEffect(() => {
    let sId = localStorage.getItem('sessionId') || localStorage.getItem('session_id');
    if (!sId) {
      sId = uuidv4();
      localStorage.setItem('sessionId', sId);
    }
    setSessionId(sId);
  }, []);

  const fetchCart = async () => {
    if (!sessionId && !loading) return;
    try {
      const headers = {};
      const token = user?.token || localStorage.getItem('token');
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

  // pridanie položky do košíka
  const addToCart = async (productId, quantity = 1) => {
    try {
      const headers = {};
      const token = user?.token || localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { productId, quantity }, { headers });
      fetchCart(); // refresh po pridaní
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  };

  useEffect(() => {
    if (!loading && sessionId) fetchCart();
  }, [user, loading, sessionId]);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, fetchCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
