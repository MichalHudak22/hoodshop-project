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
  const [loading, setLoading] = useState(true);

  // 1️⃣ Nastavenie sessionId
  useEffect(() => {
    let sId = localStorage.getItem('sessionId') || localStorage.getItem('session_id');
    if (!sId) {
      sId = uuidv4();
      localStorage.setItem('sessionId', sId);
    }
    setSessionId(sId);
  }, []);

  // 2️⃣ Refresh alebo merge košíka pri zmene user alebo sessionId
  useEffect(() => {
    if (!sessionId) return;

    const loadCart = async () => {
      setLoading(true);
      try {
        // Ak je user prihlásený, najprv merge guest košíka
        if (user && sessionId) {
          await mergeCart(sessionId, user.token);
        }

        // Potom načítame košík pre aktuálny stav
        await refreshCart();
      } catch (err) {
        console.error('Chyba pri načítaní košíka:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user, sessionId]);

  // ========================
  // Merge guest košíka do user košíka
  // ========================
  const mergeCart = async (sessionId, token) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/merge`,
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Chyba pri merge košíka:', err);
    }
  };

  // ========================
  // Načítanie košíka
  // ========================
  const refreshCart = async () => {
    if (!sessionId && !user) return;
    setLoading(true);

    try {
      const headers = {};
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });
      setCartItems(res.data);
      setCartCount(res.data.reduce((acc, i) => acc + i.quantity, 0));
    } catch (err) {
      console.error('Chyba pri refreshi košíka:', err);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Pridať položku do košíka
  // ========================
  const addToCart = async (product, quantity = 1) => {
    if (!sessionId && !user) return;
    try {
      const headers = {};
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        productId: product.id,
        quantity,
      }, { headers });

      await refreshCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // ========================
  // Odstrániť položku z košíka
  // ========================
  const removeFromCart = async (productId) => {
    if (!sessionId && !user) return;
    try {
      const headers = {};
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/cart/${productId}`, { headers });
      await refreshCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  // ========================
  // Aktualizovať množstvo
  // ========================
  const updateQuantity = async (productId, quantity) => {
    if (!sessionId && !user) return;
    try {
      const headers = {};
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/cart/${productId}`, { quantity }, { headers });
      await refreshCart();
    } catch (err) {
      console.error('Error updating cart quantity:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
