import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, setCartDirectly, refreshCart, cartLoading } = useContext(CartContext);
  const [total, setTotal] = useState(0);

  // Vypočítame total vždy keď sa zmenia položky košíka
  useEffect(() => {
    const sum = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  }, [cartItems]);

  const handleRemove = async (itemId) => {
    try {
      const headers = {};
      const sessionId = localStorage.getItem('sessionId');
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else headers['x-session-id'] = sessionId;

      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/cart/${itemId}`, { headers });

      const updated = cartItems.filter(item => item.id !== itemId);
      setCartDirectly(updated);
      refreshCart();
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const headers = {};
      const sessionId = localStorage.getItem('sessionId');
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
      else headers['x-session-id'] = sessionId;

      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/${itemId}`, { quantity: newQuantity }, { headers });

      const updated = cartItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
      setCartDirectly(updated);
      refreshCart();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (cartLoading) return <p className="p-4">Loading cart...</p>;
  if (!cartItems.length) return <p className="p-4 pt-8 text-red-500 text-center text-xl">Your cart is empty.</p>;

  return (
    <div className="relative bg-cover bg-center md:py-16 min-h-screen" style={{ backgroundImage: "url('/img/bg-shop.jpg')", backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black opacity-40 z-0" />
      <div className="relative z-10 max-w-4xl mx-auto p-6 bg-black bg-opacity-60 lg:rounded-xl border-2 border-gray-500">
        <h1 className="text-3xl font-bold mb-4 text-center py-3 text-blue-200">Shopping Cart</h1>
        <ul className="space-y-4">
          {cartItems.map(item => (
            <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-100 p-4 shadow rounded-lg space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <img src={`${import.meta.env.VITE_API_BASE_URL}${item.image}`} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm">${item.price}</p>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-3">
                <button type="button" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-lg">−</button>
                <span className="min-w-[24px] text-center text-lg font-semibold">{item.quantity}</span>
                <button type="button" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-lg">+</button>
                <button type="button" onClick={() => handleRemove(item.id)} className="ml-2 text-red-500 text-[16px] hover:text-red-500 hover:scale-105">Remove</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="text-center flex flex-col space-y-3 py-5">
          <h2 className="text-white text-lg lg:text-2xl font-semibold">
            Total: <span className="text-green-500 text-2xl font-semibold">${total.toFixed(2)}</span>
          </h2>
          <Link to="/checkout">
            <button type="button" className="w-full md:w-[50%] lg:w-80 lg:text-xl bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl">
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
