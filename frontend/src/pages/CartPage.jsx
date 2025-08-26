import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const { refreshCartCount } = useContext(CartContext);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const sessionId = localStorage.getItem('sessionId');

        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        if (sessionId) {
          headers['x-session-id'] = sessionId;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/cart`,
          { headers }
        );
        setCartItems(response.data);
      } catch (err) {
        console.error('Error fetching cart items:', err);
      }
    };

    fetchCartItems();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId');

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/${itemId}`,
        { headers }
      );

      setCartItems(cartItems.filter((item) => item.id !== itemId));
      refreshCartCount();
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) return;

      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId');

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/${itemId}`,
        { quantity: newQuantity },
        { headers }
      );

      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      refreshCartCount();
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul className="space-y-4">
          {cartItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p>Price: {item.price} €</p>
                <p>Quantity: {item.quantity}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    className="px-2 py-1 bg-gray-300 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    className="px-2 py-1 bg-gray-300 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CartPage;
