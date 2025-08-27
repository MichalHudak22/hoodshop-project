import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  useEffect(() => {
    let sId = localStorage.getItem('sessionId');
    if (!sId) {
      sId = crypto.randomUUID();
      localStorage.setItem('sessionId', sId);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const headers = {};
      const sessionId = localStorage.getItem('sessionId');
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else headers['x-session-id'] = sessionId;

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });

      setCartItems(res.data || []);
      setCartCount(res.data?.length || 0);
    } catch (err) {
      console.error('Chyba pri načítaní košíka:', err);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }, [user?.token]);

  const addToCart = async (product) => {
    try {
      const headers = {};
      const sessionId = localStorage.getItem('sessionId');
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else headers['x-session-id'] = sessionId;

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cart/add`, product, { headers });

      setCartItems(res.data || []);
      setCartCount(res.data?.length || 0);
    } catch (err) {
      console.error('Chyba pri pridávaní do košíka:', err);
    }
  };

  const setCartDirectly = (items) => {
    setCartItems(items);
    setCartCount(items.length);
  };

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;

    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cartCount, cartItems, addToCart, setCartDirectly, fetchCart, cartLoading }}>
      {children}
    </CartContext.Provider>
  );
};
