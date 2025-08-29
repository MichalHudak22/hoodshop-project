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
  console.log('=== CartContext.addToCart ===');
  console.log('Product received:', product);

  try {
    const headers = {};
    let sessionId = localStorage.getItem('sessionId');
    console.log('Session ID:', sessionId);
    console.log('User token:', user?.token);

    // Ak náhodou sessionId chýba (extra bezpečnosť)
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
      console.log('Generated new sessionId:', sessionId);
    }

    if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
    else headers['x-session-id'] = sessionId;

    const payload = {
      productId: product.id,
      quantity: 1,
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



  // ✅ Wrapper pre staršie komponenty
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
        handleAddToCart, // ← pridáme do contextu, aby staré komponenty fungovali
        setCartDirectly,
        fetchCart,
        cartLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
