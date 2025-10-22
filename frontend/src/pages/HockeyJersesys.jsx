import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import HeadTitle from '../components/HeadTitle';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const baseURL = "https://hoodshop-project.onrender.com"; // produkčné URL

const HockeyJerseys = () => {
  const [jerseys, setJerseys] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${baseURL}/products/hockey/jersey`)
      .then(response => setJerseys(response.data))
      .catch(error => console.error('Chyba pri načítavaní hokejových dresov:', error));
  }, []);

  const handleAddToCart = async (jersey) => {
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
          productId: jersey.id,
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

  const slides = jerseys.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.image,
    slug: product.slug,
  }));

  const highlightedJerseys = jerseys.filter(j => j.highlight_title && j.description);
  const featuredJersey = highlightedJerseys[0];
  const featuredJersey2 = highlightedJerseys[1];

  return (
    <div>
      {/* HEAD TITLE */}
      <HeadTitle
        title="Premium"
        highlight="Hockey Jerseys"
        bgImage="/img/football-bg.jpg"
        gradientFrom="blue-600"
        gradientVia="black"
        gradientTo="blue-900"
        description={
          <>
            Discover our exclusive collection of hockey jerseys combining{' '}
            <span className="text-blue-200 font-medium">style</span>,{' '}
            <span className="text-blue-200 font-medium">comfort</span>, and{' '}
            <span className="text-blue-200 font-medium">durability</span>.
          </>
        }
      />


      {/* 1st FEATURED JERSEY */}
      {featuredJersey && (
        <FeaturedProduct
          product={featuredJersey}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      {/* CAROUSEL */}
      <div className="py-10 bg-black relative z-10">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* 2nd FEATURED JERSEY */}
      {featuredJersey2 && (
        <FeaturedProductReversed
          product={featuredJersey2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-hockey4.jpg"
        />
      )}

      {/* ALL JERSEYS */}
      <ProductSection
        title="Discover All Jerseys"
        backgroundImage="/img/bg-hockey2.jpg"
        products={jerseys}
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

export default HockeyJerseys;
