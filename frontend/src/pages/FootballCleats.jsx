import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import HeadTitle from '../components/HeadTitle';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const FootballCleatsPage = () => {
  const [cleats, setCleats] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  const baseURL = 'https://hoodshop-project.onrender.com'; // 🔹 produkčný backend

  useEffect(() => {
    axios.get(`${baseURL}/products/football/cleats`)
      .then(response => {
        console.log('Response from backend:', response.data);
        setCleats(Array.isArray(response.data) ? response.data : response.data.products || []);
      })
      .catch(error => {
        console.error('Chyba pri načítavaní futbalových kopačiek:', error);
        setCleats([]);
      });
  }, []);

  const handleAddToCart = async (cleat) => {
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
          productId: cleat.id,
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

  const slides = Array.isArray(cleats) ? cleats.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.image,
    slug: product.slug,
  })) : [];

  const highlightedCleats = Array.isArray(cleats) ? cleats.filter(cleat => cleat.highlight_title && cleat.description) : [];
  const featuredCleat = highlightedCleats[0];
  const featuredCleat2 = highlightedCleats[1];

  return (
    <div>
      {/* HEAD TITLE */}
      <HeadTitle
        title="Discover Elite"
        highlight="Football Cleats"
        bgImage="/img/football-bg.jpg"
        gradientFrom="green-600"
        gradientVia="black"
        gradientTo="green-700"
        description={
          <>
            Step up your game with top-quality football cleats worn by pros. Our collection features advanced designs for{' '}
            <span className="text-blue-200">speed, control</span> and{' '}
            <span className="text-blue-200">comfort</span> on any pitch.
          </>
        }
      />


      {/* 1st FEATURED CLEAT */}
      <FeaturedProduct
        product={featuredCleat}
        handleAddToCart={handleAddToCart}
        backgroundImage="/img/bg-football3.jpg"
      />

      {/* CAROUSEL */}
      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* 2nd FEATURED CLEAT */}
      <FeaturedProductReversed
        product={featuredCleat2}
        handleAddToCart={handleAddToCart}
        backgroundImage="/img/bg-football3.jpg"
      />

      {/* ALL CLEATS */}
      <ProductSection
        title="All Football Cleats"
        backgroundImage="/img/bg-football5.jpg"
        products={cleats}
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

export default FootballCleatsPage;
