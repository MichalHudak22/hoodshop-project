import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';


const BACKEND_URL = 'https://hoodshop-project.onrender.com';

const DeleteProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [productToToggle, setProductToToggle] = useState(null);
  const [showInactive, setShowInactive] = useState(false); // stav zobrazenia
  const { refreshCartCount } = useContext(CartContext);


  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/products/all`);
        const products = Array.isArray(res.data) ? res.data : [];
        setAllProducts(products);
        setFiltered(products);
      } catch (err) {
        setMessage('Error loading products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    setSelectedSlug(null);

    const filteredResults = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.slug.toLowerCase().includes(q.toLowerCase())
    );
    setFiltered(filteredResults);
  };

  // Tlačidlo pre prepnutie stavu produktu (active <-> inactive)
  const handleToggleClick = () => {
    if (!selectedSlug) {
      setMessage('Please select the product you want to modify first.');
      return;
    }
    setProductToToggle(selectedSlug);
    setShowModal(true);
  };


  const confirmToggle = async () => {
    try {
      const token = localStorage.getItem('token');

      // 1. Prepnutie stavu produktu na backend
      await axios.patch(
        `${BACKEND_URL}/products/toggle/${productToToggle}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Lokálna aktualizácia produktov (okamžitý efekt)
      const updated = allProducts.map((p) =>
        p.slug === productToToggle ? { ...p, is_active: p.is_active ? 0 : 1 } : p
      );
      setAllProducts(updated);
      setSelectedSlug(null);
      setMessage('Product status has been updated.');

      // 2a. Aktualizácia filtered podľa showInactive, aby sa produkt presunul
      setFiltered(updated.filter(p =>
        showInactive ? p.is_active === 0 : p.is_active === 1
      ));

      // 3. Ak produkt je teraz inactive, odstrániť ho z košíka
      const toggledProduct = updated.find(p => p.slug === productToToggle);
      if (!toggledProduct.is_active) {
        try {
          const sessionId = localStorage.getItem('session_id') || '';
          const headers = token
            ? { Authorization: `Bearer ${token}` }
            : { 'x-session-id': sessionId };

          await axios.delete(`${BACKEND_URL}/cart/remove/${productToToggle}`, { headers });
        } catch (err) {
          // ignorujeme 404, všetko ostatné logujeme
          if (err.response?.status !== 404) {
            console.error('Error removing product from cart', err);
          }
        }
      }

      // 4. Aktualizovať počet položiek v košíku cez CartContext
      refreshCartCount();

    } catch (err) {
      console.error(err);
      setMessage('Error updating product.');
    } finally {
      setShowModal(false);
      setProductToToggle(null);
    }
  };


  // Filter produktov podľa active/inactive
  const displayedProducts = allProducts
    .filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase().includes(query.toLowerCase())
    )
    .filter(p => (showInactive ? p.is_active === 0 : p.is_active === 1));


  return (
    <div className="w-full mx-auto p-6 bg-black bg-opacity-70 text-white md:rounded-xl border border-gray-700">
      <h2 className="text-xl pb-5 md:text-2xl lg:text-3xl font-semibold mb-4 text-center text-blue-200">
        {showInactive ? 'Inactive Products' : 'Active Products'}
      </h2>

      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setShowInactive(false)}
          className={`px-4 py-2 rounded-lg ${!showInactive ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Active Products
        </button>
        <button
          onClick={() => setShowInactive(true)}
          className={`px-4 py-2 rounded-lg ${showInactive ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Inactive Products
        </button>
      </div>

      <input
        type="text"
        placeholder="Enter product name"
        value={query}
        onChange={handleSearch}
        className="block w-full max-w-3xl px-4 py-2 rounded-lg bg-gray-900 text-white text-center placeholder-gray-400 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4 mx-auto"
      />

      <div className="h-[400px] max-w-3xl mx-auto overflow-y-auto scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-800 rounded-lg border-2 border-gray-300">
        <ul className="divide-y divide-gray-700">
          {Array.isArray(displayedProducts) && displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <li
                key={product.slug}
                className={`p-4 transition cursor-pointer hover:bg-gray-800 ${selectedSlug === product.slug ? 'bg-red-900 text-white' : ''
                  }`}
                onClick={() => setSelectedSlug(product.slug)}
              >
                <p className="text-lg font-medium">{product.name}</p>
                <p className="text-sm text-blue-200">
                  <span className="text-gray-200">Brand:</span> {product.brand}{' '}
                  <span className="text-gray-200">| Category:</span> {product.category}{' '}
                  <span className="text-gray-100">| Type:</span> {product.type}{' '}
                  <span className="text-gray-100">| Status:</span> {product.is_active ? 'Active' : 'Inactive'}
                </p>
              </li>
            ))
          ) : (
            <li className="p-4 text-red-400 text-center">
              {loading ? 'Loading products...' : 'Žiadne produkty na zobrazenie.'}
            </li>
          )}
        </ul>
      </div>

      <div className="flex flex-col justify-center mt-6">
        <button
          onClick={handleToggleClick}
          className={`w-[210px] py-2 px-4 text-sm md:text-lg rounded-lg transition mx-auto cursor-pointer ${showInactive ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-red-700 hover:bg-red-600 text-white'
            }`}
          disabled={!selectedSlug}
        >
          {showInactive ? 'Activate Product' : 'Deactivate Product'}
        </button>


        <div className="min-h-[24px] mt-2 flex items-center justify-center">
          {message && <p className="text-green-400 text-center">{message}</p>}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-500 max-w-md w-full">
            <h3 className="text-xl text-white font-semibold mb-4 text-center">
              Do you really want to change the product status?
            </h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmToggle}
                className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setProductToToggle(null);
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteProduct;
