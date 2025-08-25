import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const [sessionId] = useState(() => {
    let sId = localStorage.getItem('sessionId');
    if (!sId) {
      sId = uuidv4();
      localStorage.setItem('sessionId', sId);
    }
    return sId;
  });

  const fetchCart = useCallback(async () => {
    try {
      const headers = {};
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      } else {
        headers['x-session-id'] = sessionId;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });
      setCartItems(res.data);
      setCartCount(res.data.length);
    } catch (err) {
      console.error('Chyba pri načítaní košíka:', err);
      setCartItems([]);
      setCartCount(0);
    }
  }, [user, sessionId]);

  // ✅ fetchCart sa zavolá vždy keď sa zmení user alebo session
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
