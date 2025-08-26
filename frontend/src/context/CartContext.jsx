import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  // Synchronne nastav sessionId pri mountnutí
  useEffect(() => {
    let sId = localStorage.getItem('sessionId') || localStorage.getItem('session_id');
    if (!sId) {
      sId = uuidv4();
      localStorage.setItem('sessionId', sId);
    }
    setSessionId(sId);
  }, []);

  // Fetch košíka vždy keď sa zmení user alebo sessionId
  useEffect(() => {
    if (!sessionId) return;

    const fetchCart = async () => {
      try {
        const headers = {};
        if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
        else if (sessionId) headers['x-session-id'] = sessionId;

        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });
        setCartItems(res.data);
        setCartCount(res.data.reduce((acc, i) => acc + i.quantity, 0));
      } catch (err) {
        console.error('Chyba pri načítaní košíka:', err);
        setCartItems([]);
        setCartCount(0);
      }
    };

    fetchCart();
  }, [user, sessionId]);

  const refreshCart = async () => {
    if (!sessionId) return;

    try {
      const headers = {};
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });
      setCartItems(res.data);
      setCartCount(res.data.reduce((acc, i) => acc + i.quantity, 0));
    } catch (err) {
      console.error('Chyba pri refreshi košíka:', err);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
