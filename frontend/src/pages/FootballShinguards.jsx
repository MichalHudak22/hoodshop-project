import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const FootballShinguards = () => {
  const [shinguards, setShinguards] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  const baseURL = 'https://hoodshop-project.onrender.com'; // 🔹 produkčný backend

  useEffect(() => {
    axios.get(`${baseURL}/products/football/shinguards`)
      .then(response => {
        console.log('Response from backend:', response.data);
        setShinguards(Array.isArray(response.data) ? response.data : response.data.products || []);
      })
      .catch(error => {
        console.error('Chyba pri načítavaní chráničov:', error);
        setShinguards([]);
      });
  }, []);

  const handleAddToCart = async (shinguard) => {
    const sessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${baseURL}/api/cart`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(!token && sessionId && { "x-session-id": sessionId }),
        },
        body: JSON.stringify({
          productId: shinguard.id,
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

  const slides = Array.isArray(shinguards) ? shinguards.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: `${baseURL}${product.image}`, // 🔹 obrázky z produkčného backendu
  })) : [];

  const highlightedShinguards = Array.isArray(shinguards) ? shinguards.filter(s => s.highlight_title && s.description) : [];
  const featuredShinguard = highlightedShinguards[0];
  const featuredShinguard2 = highlightedShinguards[1];

  return (
    <div>
      {/* HEAD TITLE */}
      <section className="relative text-center py-10 px-4 bg-gradient-to-br from-green-600 via-black to-green-700 text-white overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0 bg-[url('/img/football-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            Discover Premium <span className="text-blue-200">Football Shinguards</span>
          </h1>
          <p className="text-[14px] md:text-lg lg:text-xl text-gray-100 leading-relaxed">
            Protect yourself on the field with our high-quality football shinguards. Our collection offers optimal{' '}
            <span className="text-blue-200 font-medium">protection</span>,{' '}
            <span className="text-blue-200 font-medium">comfort</span>, and{' '}
            <span className="text-blue-200 font-medium">performance</span> for every player.
          </p>
        </div>
      </section>

      {/* 1st FEATURED SHINGUARD */}
      {featuredShinguard && (
        <FeaturedProduct
          product={featuredShinguard}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-football3.jpg"
        />
      )}

      {/* CAROUSEL */}
      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* 2nd FEATURED SHINGUARD */}
      {featuredShinguard2 && (
        <FeaturedProductReversed
          product={featuredShinguard2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-football3.jpg"
        />
      )}

      {/* ALL SHINGUARDS */}
      <ProductSection
        title="All Football Shinguards"
        backgroundImage="/img/bg-football5.jpg"
        products={shinguards}
        onAddToCart={handleAddToCart}
      />

      {/* MESSAGE NA STRED OBRAZOVKY */}
      {message && (
        <div className="fixed top-16 right-6 bg-black text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default FootballShinguards;
