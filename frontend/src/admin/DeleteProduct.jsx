import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DeleteProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/products/all');
        const products = Array.isArray(res.data) ? res.data : [];
        setAllProducts(products);
        setFiltered(products);
      } catch (err) {
        setMessage('Chyba pri načítavaní produktov');
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);


  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);

      return () => clearTimeout(timer); // cleanup on unmount or message change
    }
  }, [message]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    setSelectedSlug(null);

    const filteredResults = allProducts.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.slug.toLowerCase().includes(q.toLowerCase())
    );
    setFiltered(filteredResults);
  };

  const handleDeleteClick = () => {
    if (!selectedSlug) {
      setMessage('Najprv vyber produkt, ktorý chceš vymazať.');
      return;
    }
    setProductToDelete(selectedSlug);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/products/${productToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = allProducts.filter((p) => p.slug !== productToDelete);
      setAllProducts(updated);
      setFiltered(updated);
      setSelectedSlug(null);
      setMessage('The product was successfully deleted.');
    } catch (err) {
      setMessage('Error deleting the product.');
    } finally {
      setShowModal(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-black bg-opacity-70 text-white md:rounded-xl border border-gray-700">
      <h2 className="text-xl pb-5 md:text-2xl lg:text-3xl font-semibold mb-4 text-center text-blue-200">
        Search and Delete Product
      </h2>

      <input
        type="text"
        placeholder="Enter product name"
        value={query}
        onChange={handleSearch}
        className="block w-full max-w-3xl px-4 py-2 rounded-lg bg-gray-900 text-white text-center placeholder-gray-400 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4 mx-auto"
      />

      <div className="h-[400px] max-w-3xl mx-auto overflow-y-auto scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-800 rounded-lg border-2 border-gray-300">
        <ul className="divide-y divide-gray-700">
          {Array.isArray(filtered) && filtered.map((product) => (
            <li
              key={product.slug}
              className={`p-4 transition cursor-pointer hover:bg-gray-800 ${selectedSlug === product.slug ? 'bg-red-900 text-white' : ''
                }`}
              onClick={() => setSelectedSlug(product.slug)}
            >
              <p className="text-lg font-medium">{product.name}</p>
              <p className="text-sm text-blue-200">
                <span className='text-gray-200'>Brand:</span> {product.brand} <span className='text-gray-200'>| Category:</span> {product.category} <span className='text-gray-100'>| Type:</span> {product.type}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col justify-center mt-6">
        <button
          onClick={handleDeleteClick}
          className="w-[190px] bg-red-700 hover:bg-red-600 text-white py-2 px-4 text-sm md:text-lg rounded-lg transition mx-auto"
          disabled={!selectedSlug}
        >
          Delete Product
        </button>

        <div className="min-h-[24px] mt-2 flex items-center justify-center">
          {message && <p className="text-green-400 text-center">{message}</p>}
          {loading && <p className="text-blue-300 text-center">Loading products...</p>}
        </div>
      </div>


      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-500 max-w-md w-full">
            <h3 className="text-xl text-white font-semibold mb-4 text-center">Do you really want to delete this product?</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setProductToDelete(null);
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
