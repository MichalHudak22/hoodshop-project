// CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(); // <-- toto ti chýba

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(AuthContext);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let sId = localStorage.getItem("sessionId");
    if (!sId) {
      sId = crypto.randomUUID();
      localStorage.setItem("sessionId", sId);
    }
    setSessionId(sId);
  }, []);

  const fetchCartFromBackend = async () => {
    if (!user && !sessionId) return;
    try {
      const headers = {};
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;
      else headers['x-session-id'] = sessionId;

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { headers });
      setCartItems(res.data || []);
    } catch (err) {
      console.error(err);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCartFromBackend();
  }, [user, sessionId]);

  const addToCart = async (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? {...i, quantity: i.quantity+1} : i);
      return [...prev, {...product, quantity:1}];
    });

    try {
      const headers = {};
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;
      else headers['x-session-id'] = sessionId;

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, { productId: product.id }, { headers });
      await fetchCartFromBackend();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, fetchCartFromBackend }}>
      {children}
    </CartContext.Provider>
  );
};
