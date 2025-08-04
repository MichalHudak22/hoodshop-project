import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import ProductsCarousel from '../components/ProductsCarousel';
import FeaturedProduct from '../components/FeaturedProduct';
import FeaturedProductReversed from '../components/FeaturedProductReversed';
import ProductSection from '../components/ProductSection';

const FootballBalls = () => {
  const [balls, setBalls] = useState([]);
  const { refreshCartCount } = useContext(CartContext);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('${import.meta.env.VITE_API_BASE_URL}
/products/football/ball')
      .then(response => setBalls(response.data))
      .catch(error => console.error('Chyba pri načítavaní football lôpt:', error));
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

  // Carousel slides
  const slides = balls.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: `${import.meta.env.VITE_API_BASE_URL}
${product.image}`, // absolútna URL
  }));

  const highlightedBalls = balls.filter(ball => ball.highlight_title && ball.description);
  const featuredBall = highlightedBalls[0];
  const featuredBall2 = highlightedBalls[1];

  return (
    <div>
     {/* HEAD TITLE */}
      <section
        className="relative text-center py-10 px-4 bg-gradient-to-br  from-green-600 via-black to-green-700 text-white overflow-hidden border-b-4 border-black"
      >
        <div className="absolute inset-0 bg-[url('/img/football-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 tracking-wide drop-shadow-md">
            Discover Legendary <span className="text-blue-200">Football Balls</span>
          </h1>
          <p className="text-md md:text-lg lg:text-xl text-gray-100 leading-relaxed">
            Explore our exclusive collection of premium football balls – including
            <span className="text-blue-200 font-medium"> iconic models</span> used in the{' '}
            <span className="text-blue-200 font-medium">FIFA World Cup</span> in Brazil and{' '}
            <span className="text-blue-200 font-medium">Champions League</span> finals.
          </p>
        </div>
      </section>


      {/* 1st FEATURED BALL */}
      {featuredBall && (
        <FeaturedProduct 
          product={featuredBall} 
          handleAddToCart={handleAddToCart} 
          backgroundImage="/img/bg-football3.jpg" 
        />
      )}

      {/* CAROUSEL */}
      <div className="py-10 bg-black">
        <ProductsCarousel slides={slides} handleAddToCart={handleAddToCart} />
      </div>

      {/* 2nd FEATURED BALL */}
      {featuredBall2 && (
        <FeaturedProductReversed
          product={featuredBall2}
          handleAddToCart={handleAddToCart}
          backgroundImage="/img/bg-football3.jpg"
        />
      )}

      {/* ALL BALLS */}
      <ProductSection
        title="All Football Balls"
        backgroundImage="/img/bg-football5.jpg"
        products={balls}
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

export default FootballBalls;
