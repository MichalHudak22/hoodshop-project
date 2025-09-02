import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const CyclingHelmets = () => {
  const [helmets, setHelmets] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  const baseURL = 'https://hoodshop-project.onrender.com'; // 🔹 produkčný backend

  useEffect(() => {
    axios.get(`${baseURL}/products/cycling/helmets`)
      .then(response => {
        console.log('Response from backend:', response.data);
        setHelmets(Array.isArray(response.data) ? response.data : response.data.products || []);
      })
      .catch(error => {
        console.error('Chyba pri načítavaní prilieb:', error);
      });
  }, []);

  const handleAddToCart = async (helmet) => {
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

  // Carousel slides
  const slides = helmets.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: `${baseURL}${product.image}`, // 🔹 obrázky z produkčného backendu
  }));

  // Výber 2 zvýraznených produktov
  const highlighted = helmets.filter(p => p.highlight_title && p.description);
  const featured1 = highlighted[0];
  const featured2 = highlighted[1];

  return (
    <div>
      {/* HEAD TITLE */}
      <section className="relative text-center py-10 px-4 bg-gradient-to-br from-orange-400 via-black to-orange-400 text-white overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0 bg-[url('/img/cycling-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            Top-Quality <span className="text-blue-200">Cycling Helmets</span> for Every Ride
          </h1>
          <p className="text-md md:text-lg lg:text-xl text-gray-100 leading-relaxed">
            Discover our selection of premium helmets for{' '}
            <span className="text-blue-200 font-medium">safety</span>,{' '}
            <span className="text-blue-200 font-medium">comfort</span>, and{' '}
            <span className="text-blue-200 font-medium">style</span> — ideal for every cyclist, from daily commuters to pro riders.
          </p>
        </div>
      </section>

      {/* 1st FEATURED HELMET */}
      {featured1 && (
        <FeaturedProduct
          product={featured1}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-cycling4.jpg"
        />
      )}

      {/* CAROUSEL */}
      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* 2nd FEATURED HELMET */}
      {featured2 && (
        <FeaturedProductReversed
          product={featured2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-cycling4.jpg"
        />
      )}

      {/* ALL HELMETS */}
      <ProductSection
        title="Best Cycling Helmets"
        backgroundImage="/img/bg-cycling3.jpg"
        products={helmets}
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

export default CyclingHelmets;
