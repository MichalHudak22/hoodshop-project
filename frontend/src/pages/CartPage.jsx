import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from "react-router-dom";

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const { refreshCartCount } = useContext(CartContext);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  // Pri mountnutí vygeneruj alebo načítaj sessionId
  useEffect(() => {
    let sId = localStorage.getItem('sessionId');
    if (!sId) {
      sId = uuidv4();
      localStorage.setItem('sessionId', sId);
    }
    setSessionId(sId);
  }, []);

  // Načítanie košíka
  useEffect(() => {
    if (!sessionId) return;

    const fetchCart = async () => {
      setLoading(true);
      try {
        const headers = {};
        if (user && user.token) {
          headers.Authorization = `Bearer ${user.token}`;
        } else {
          headers['x-session-id'] = sessionId;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/cart`,
          { headers }
        );

        setCartItems(response.data);
        calculateTotal(response.data);
        refreshCartCount();
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, sessionId, refreshCartCount]);

  // Výpočet ceny
  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  // Odstránenie položky
  const handleRemove = async (itemId) => {
    try {
      const headers = {};
      if (user && user.token) {
        headers.Authorization = `Bearer ${user.token}`;
      } else {
        headers['x-session-id'] = sessionId;
      }

      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/${itemId}`,
        { headers }
      );

      const updated = cartItems.filter(item => item.id !== itemId);
      setCartItems(updated);
      calculateTotal(updated);
      refreshCartCount();
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  // Zmena množstva
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const headers = {};
      if (user && user.token) {
        headers.Authorization = `Bearer ${user.token}`;
      } else {
        headers['x-session-id'] = sessionId;
      }

      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/${itemId}`,
        { quantity: newQuantity },
        { headers }
      );

      const updated = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updated);
      calculateTotal(updated);
      refreshCartCount();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) return <p className="p-4">Loading cart...</p>;
  if (cartItems.length === 0) return <p className="p-4 pt-8 text-red-500 text-center text-xl">Your cart is empty.</p>;

  return (
    <div
      className="relative bg-cover bg-center md:py-16 min-h-screen"
      style={{
        backgroundImage: "url('/img/bg-shop.jpg')",
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay pre stmavenie */}
      <div className="absolute inset-0 bg-black opacity-40 z-0" />

      {/* Obsah s priehľadným pozadím */}
      <div className="relative z-10 max-w-4xl mx-auto p-6 bg-black bg-opacity-60 lg:rounded-xl border-2 border-gray-500">
        <h1 className="text-3xl font-bold mb-4 text-center py-3 text-blue-200">
          Shopping Cart
        </h1>
        <ul className="space-y-4">
          {cartItems.map(item => (
            <li
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-100 p-4 shadow rounded-lg space-y-4 sm:space-y-0"
            >
              {/* LEFT - image + name */}
              <div className="flex items-center space-x-4">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${item.image}`}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm">${item.price}</p>
                </div>
              </div>

              {/* RIGHT - quantity and remove */}
              <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-lg"
                >
                  −
                </button>
                <span className="min-w-[24px] text-center text-lg font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-lg"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="ml-2 text-red-500 text-[16px] hover:text-red-500 hover:scale-105"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="text-center flex flex-col space-y-3 py-5">
          <h2 className="text-white text-lg lg:text-2xl font-semibold">
            Total: <span className="text-green-500 text-2xl font-semibold">${total.toFixed(2)}</span>
          </h2>
          <Link to="/checkout">
            <button type="button" className="w-full md:w-[50%] lg:w-80 lg:text-xl bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl"
            >
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
