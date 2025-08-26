import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    try {
      const headers = {};
      const token = user?.token;
      const sessionId = localStorage.getItem('session_id') || localStorage.getItem('sessionId');
      if (token) headers['Authorization'] = `Bearer ${token}`;
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

  // vždy keď sa user zmení (login/logout) fetchni košík
  useEffect(() => {
    fetchCart();
  }, [user]); // <--- závislosť na user

  return (
    <CartContext.Provider value={{ cartItems, cartCount, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
