import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import ProductsCarousel from '../components/ProductsCarousel';
import ProductSection from '../components/ProductSection';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import { CartContext } from '../context/CartContext';  // pridaj tento import

const HockeyHelmets = () => {
  const [helmets, setHelmets] = useState([]);
  const { refreshCartCount } = useContext(CartContext);  // použijeme kontext
  const [message, setMessage] = useState('');

   useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/hockey/helmets`)
      .then(response => setHelmets(response.data))
      .catch(error => console.error('Chyba pri načítavaní hokejových prilieb:', error));
  }, []);

  const handleAddToCart = async (helmet) => {
    const sessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(!token && sessionId && { "x-session-id": sessionId }),
        },
        body: JSON.stringify({
          productId: helmet.id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Product added to cart!");
        refreshCartCount();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage("Failed to add to cart: " + data.message);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Error adding to cart");
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // UPRAVA: upravil som slides podľa vzoru HockeyJerseys / HockeyPage
  const slides = helmets.map(product => ({
    id: product.id,
    name: product.name,          // namiesto title použiť name (UPRAVA)
    brand: product.brand,
    price: product.price,
    image: product.image,        // NEposielať full URL, len relatívnu cestu (UPRAVA)
    // buttonText a link som odstránil, nie sú potrebné (UPRAVA)
  }));

  const highlighted = helmets.filter(h => h.highlight_title && h.description);
  const featured1 = highlighted[0];
  const featured2 = highlighted[1];

  return (
    <div>
      {/* HEAD TITLE */}
      <section
        className="relative text-center py-10 px-4 bg-gradient-to-br from-blue-600 via-black to-blue-900 text-white overflow-hidden border-b-4 border-black"
      >
        <div className="absolute inset-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            Premium <span className="text-blue-200">Hockey Helmets</span>
          </h1>
          <p className="text-md md:text-lg lg:text-xl text-gray-100 leading-relaxed">
            Stay protected on the ice with our top-tier selection of hockey helmets offering the best in{' '}
            <span className="text-blue-200 font-medium">safety</span> and{' '}
            <span className="text-blue-200 font-medium">comfort</span>.
          </p>
        </div>
      </section>


      {featured1 && (
        <FeaturedProduct
          product={featured1}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      <div className="py-10 bg-black border-y-4 border-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {featured2 && (
        <FeaturedProductReversed
          product={featured2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      <ProductSection
        title="Discover All Helmets"
        backgroundImage="/img/bg-hockey2.jpg"
        products={helmets}
        onAddToCart={handleAddToCart}
      />

      {/* ✅ MESSAGE NA STRED OBRAZOVKY */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default HockeyHelmets;
