import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import ProductsCarousel from '../components/ProductsCarousel';
import ProductSection from '../components/ProductSection';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import { CartContext } from '../context/CartContext';

const HockeySkates = () => {
  const [skates, setSkates] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('${import.meta.env.VITE_API_BASE_URL}
/products/hockey/skates')
      .then(response => setSkates(response.data))
      .catch(error => console.error('Chyba pri načítavaní hokejových korčúľ:', error));
  }, []);

  const handleAddToCart = async (jersey) => {
    const sessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL}
/api/cart', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(!token && sessionId && { "x-session-id": sessionId }),
        },
        body: JSON.stringify({
          productId: jersey.id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Product added to cart!");
        refreshCartCount();

        // automaticky zmizne po 3 sekundách
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

  // Pripravíme dáta pre carousel (obrázok, názov, značka, cena, tlačidlo)
  const slides = skates.map(product => ({
     id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: `${import.meta.env.VITE_API_BASE_URL}
${product.image}`, // absolútna URL
  }));

  // Vyfiltrujeme zvýraznené produkty pre featured sekcie
  const highlightedSkates = skates.filter(p => p.highlight_title && p.description);
  const featuredSkate1 = highlightedSkates[0];
  const featuredSkate2 = highlightedSkates[1];

  return (
    <div>
   {/* HLAVNÝ NADPIS */}
    <section
      className="relative text-center py-10 px-4 bg-gradient-to-br from-blue-600 via-black to-blue-900 text-white overflow-hidden border-b-4 border-black"
    >
      <div className="absolute inset-0 bg-[url('/img/football-bg.jpg')] bg-cover bg-center opacity-20"></div>
      <div className="relative z-10 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
      Find the Fastest <span className="text-blue-200">Hockey Skates</span>
      </h1>

        <p className="text-md md:text-lg lg:text-xl text-gray-100 leading-relaxed">
          Explore top-tier hockey skates designed for{' '}
          <span className="text-blue-200 font-medium">performance</span>,{' '}
          <span className="text-blue-200 font-medium">comfort</span>, and{' '}
          <span className="text-blue-200 font-medium">speed</span> on the ice.
        </p>
      </div>
    </section>



      {/* 1. VYBRANÝ PRODUKT */}
      {featuredSkate1 && (
        <FeaturedProduct
          product={featuredSkate1}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      {/* CAROUSEL PRODUKTOV */}
      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* 2. VYBRANÝ PRODUKT */}
      {featuredSkate2 && (
        <FeaturedProductReversed
          product={featuredSkate2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      {/* VŠETKY PRODUKTY */}
      <ProductSection
        title="Discover All Skates"
        backgroundImage="/img/bg-hockey2.jpg"
        products={skates}
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

export default HockeySkates;
