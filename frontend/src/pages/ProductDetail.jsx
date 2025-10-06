import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { slug } = useParams();
  const { refreshCartCount } = useContext(CartContext);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Funkcia na opravu URL (Cloudinary vs lokálne)
  const fixCloudinaryUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('https://') || url.startsWith('http://')) return url; // už je plná URL
    return `${API_BASE_URL}${url}`; // lokálna cesta
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products/${slug}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Product not found', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, API_BASE_URL]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('session_id') || localStorage.getItem('sessionId');

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else if (sessionId) headers['x-session-id'] = sessionId;

      await axios.post(`${API_BASE_URL}/api/cart`, {
        productId: product.id,
        quantity: 1
      }, { headers });

      refreshCartCount();
      setMessage("Produkt bol pridaný do košíka!");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Nepodarilo sa pridať produkt do košíka:', err);
      setMessage("Chyba pri pridávaní do košíka.");
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!product) return <p className="p-6 text-center">Product not found.</p>;

  return (
    <div
      className="relative bg-cover bg-center py-16 min-h-screen"
      style={{
        backgroundImage: "url('/img/bg-sports.jpg')",
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay pre stmavenie */}
      <div className="absolute inset-0 bg-black opacity-60 z-0" />

      {/* Obsah s priehľadným pozadím */}
      <div className="relative z-10 p-6">
        <div className="p-8 mt-12 max-w-4xl mx-auto bg-white bg-opacity-95 rounded-lg shadow-lg border-4 border-black">
          <h1 className="text-4xl font-extrabold mb-6 text-gray-900">{product.name}</h1>

          <Link
            to={`/brands/${product.brand.toLowerCase()}`}
            className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-lg font-semibold hover:bg-indigo-200 transition mb-3"
          >
            {product.brand}
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            <img
              src={fixCloudinaryUrl(product.image)}
              alt={product.name}
              className="w-full md:w-1/2 max-h-[400px] object-contain rounded-lg border border-gray-300"
            />
            <div className="flex flex-col justify-between md:w-1/2">
              <div>
                <div className="mb-4">
                  <Link
                    to={`/sports/${product.category.toLowerCase()}`}
                    className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold mr-2 hover:bg-indigo-200 transition"
                  >
                    Category: {product.category}
                  </Link>

                  <Link
                    to={`/sports/${product.category.toLowerCase()}/${product.type.toLowerCase()}`}
                    className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold hover:bg-indigo-200 transition"
                  >
                    Type: {product.type}
                  </Link>
                </div>

                <p className="text-3xl font-bold text-green-700 mb-4">{product.price} €</p>
                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
              </div>

              <button
                onClick={handleAddToCart}
                className="mt-8 w-full py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-600 transition hover:scale-105 ease-in-out"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HLÁŠKA HORE VPRAVO */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
