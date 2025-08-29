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

      // backend môže vrátiť { message, cartItems } alebo rovno pole
      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.cartItems)
        ? res.data.cartItems
        : [];

      setCartItems(items);
      setCartCount(items.length);
      console.log('Cart fetched:', items);
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
  try {
    const headers = {};
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
    }

    if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
    else headers['x-session-id'] = sessionId;

    const payload = {
      productId: product.productId ?? product.id,
      quantity: product.quantity ?? 1,
    };

    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, payload, { headers });

    // backend môže vrátiť pole alebo objekt { cartItems: [...] }
    const items = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.cartItems)
      ? res.data.cartItems
      : [];

    // **Dôležité**: aktualizujeme stav aj count
    setCartItems(items);
    setCartCount(items.length);

    // Voliteľne: zavoláme fetchCart, aby sme mali úplne aktuálny stav z backendu
    fetchCart();

    console.log('Cart updated after add:', items);
  } catch (err) {
    console.error('Chyba pri pridávaní do košíka:', err);
  }
};


  const handleAddToCart = async (product) => {
    await addToCart(product);
  };

  const setCartDirectly = (items) => {
    if (!Array.isArray(items)) items = [];
    setCartItems(items);
    setCartCount(items.length);
  };

  useEffect(() => {
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
