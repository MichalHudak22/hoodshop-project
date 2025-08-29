import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // Inicializácia sessionId
  useEffect(() => {
    let sId = localStorage.getItem('sessionId');
    if (!sId) {
      sId = crypto.randomUUID();
      localStorage.setItem('sessionId', sId);
      console.log('Generated new sessionId:', sId);
    }
  }, []);

  // Načítanie obsahu košíka
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
      console.log('Cart fetched:', res.data);
    } catch (err) {
      console.error('Chyba pri načítaní košíka:', err);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }, [user?.token]);

  // Pridanie produktu do košíka
  const addToCart = async (product) => {
    console.log('=== CartContext.addToCart ===');
    console.log('Product received:', product);

    try {
      const headers = {};
      let sessionId = localStorage.getItem('sessionId');

      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId);
        console.log('Generated new sessionId:', sessionId);
      }

      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else headers['x-session-id'] = sessionId;

      // ✅ Tu zaručíme, že productId vždy existuje
      const payload = {
        productId: product.productId ?? product.id, // podpora oboch tvarov
        quantity: product.quantity ?? 1,
      };

      console.log('Payload to send:', payload);
      console.log('Headers to send:', headers);

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, payload, { headers });
      console.log('Response from backend:', res.data);

      setCartItems(res.data || []);
      setCartCount(res.data?.length || 0);
    } catch (err) {
      console.error('Chyba pri pridávaní do košíka:', err);
    }
  };

  // Wrapper pre staršie komponenty
  const handleAddToCart = async (product) => {
    await addToCart(product);
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
    <CartContext.Provider
      value={{
        cartCount,
        cartItems,
        addToCart,
        handleAddToCart,
        setCartDirectly,
        fetchCart,
        cartLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
